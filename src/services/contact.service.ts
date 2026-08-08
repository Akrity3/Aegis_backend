import { ContactRepository } from "../repositories/contact.repository";
import { CreateContactDTOType, UpdateContactDTOType } from "../dtos/contact.dto";
import { HttpException } from "../exceptions/http-exception";
import { UserModel } from "../models/user.model";
import { NotificationModel } from "../models/notification.model";
import { ContactModel, ContactStatus } from "../models/contact.model";
import { socketService } from "../socket/socket.service";

export class ContactService {
    private contactRepository: ContactRepository;

    constructor() {
        this.contactRepository = new ContactRepository();
    }

    async addContact(userId: string, data: CreateContactDTOType) {
        try {
            const currentUser = await UserModel.findById(userId);
            if (!currentUser) {
                throw new HttpException(404, "User not found");
            }

            const cleanPhone = data.phoneNumber.trim();
            const normalizedPhone = cleanPhone.replace(/^\+?977/, '').replace(/\D/g, '');
            const tenDigitPhone = normalizedPhone.length >= 10 ? normalizedPhone.slice(-10) : normalizedPhone;

            if (currentUser.phoneNumber) {
                const currentNorm = currentUser.phoneNumber.trim().replace(/^\+?977/, '').replace(/\D/g, '');
                const currentTenDigit = currentNorm.length >= 10 ? currentNorm.slice(-10) : currentNorm;
                if (currentTenDigit === tenDigitPhone) {
                    throw new HttpException(400, "You cannot add your own phone number as a contact");
                }
            }

            const existingContact = await ContactModel.findOne({
                userId,
                $or: [
                    { phoneNumber: cleanPhone },
                    { phoneNumber: normalizedPhone },
                    { phoneNumber: `+977${normalizedPhone}` },
                    { phoneNumber: new RegExp(tenDigitPhone + '$') }
                ]
            });
            if (existingContact) {
                throw new HttpException(400, "This phone number is already in your contacts");
            }

            // Check if phone number belongs to a registered Aegis user across all phone formats
            const registeredTargetUser = await UserModel.findOne({
                $or: [
                    { phoneNumber: cleanPhone },
                    { phoneNumber: normalizedPhone },
                    { phoneNumber: `+977${normalizedPhone}` },
                    { phoneNumber: new RegExp(tenDigitPhone + '$') }
                ]
            });

            let status: ContactStatus = "unregistered";
            let targetUserId: string | undefined = undefined;
            let avatarUrl: string | undefined = data.avatarUrl;

            if (registeredTargetUser) {
                if (registeredTargetUser._id.toString() === userId) {
                    throw new HttpException(400, "You cannot add yourself as a contact");
                }
                status = "pending";
                targetUserId = registeredTargetUser._id.toString();
                if (!avatarUrl && registeredTargetUser.profilePicture) {
                    avatarUrl = registeredTargetUser.profilePicture;
                }
            }

            const contactData: any = {
                ...data,
                phoneNumber: cleanPhone,
                status,
                targetUserId,
                avatarUrl,
                isEmergencyContact: data.isEmergencyContact ?? true,
            };

            const contact = await this.contactRepository.createContact(userId, contactData);

            // If registered target user, send in-app notification & socket event
            if (registeredTargetUser) {
                const notif = await NotificationModel.create({
                    userId: registeredTargetUser._id,
                    senderId: userId as any,
                    title: "Trusted Contact Request",
                    message: `${currentUser.firstName} ${currentUser.lastName} wants to add you as a Trusted Contact.`,
                    type: "contact_request",
                    metadata: { contactId: contact._id },
                });

                socketService.emitToUser(registeredTargetUser._id.toString(), "trusted:request", {
                    contactId: contact._id,
                    requester: {
                        _id: currentUser._id,
                        name: `${currentUser.firstName} ${currentUser.lastName}`,
                        phoneNumber: currentUser.phoneNumber,
                        avatarUrl: currentUser.profilePicture,
                    },
                });

                socketService.emitToUser(registeredTargetUser._id.toString(), "notification:new", notif);
            }

            return contact;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new HttpException(400, "This phone number is already in your contacts");
            }
            throw error;
        }
    }

    async getContacts(userId: string, page: number = 1, limit: number = 50, sort: string = "name", status?: ContactStatus) {
        return await this.contactRepository.getContactsByUserId(userId, page, limit, sort, status);
    }

    async getPendingRequests(userId: string) {
        return await this.contactRepository.getPendingRequestsForUser(userId);
    }

    async respondToRequest(userId: string, contactId: string, actionStatus: "accepted" | "rejected") {
        const contact = await this.contactRepository.getContactById(contactId);
        if (!contact) {
            throw new HttpException(404, "Contact request not found");
        }

        if (!contact.targetUserId || contact.targetUserId._id.toString() !== userId) {
            throw new HttpException(403, "You are not authorized to respond to this request");
        }

        if (contact.status !== "pending") {
            throw new HttpException(400, `Contact request is already ${contact.status}`);
        }

        if (actionStatus === "rejected") {
            contact.status = "rejected";
            await contact.save();

            const respondent = await UserModel.findById(userId);
            const notif = await NotificationModel.create({
                userId: contact.userId,
                senderId: userId as any,
                title: "Trusted Contact Request Rejected",
                message: `${respondent?.firstName || "User"} declined your trusted contact request.`,
                type: "contact_rejected",
            });

            socketService.emitToUser(contact.userId.toString(), "notification:new", notif);

            return contact;
        }

        // Action: Accepted
        contact.status = "accepted";
        await contact.save();

        const respondent = await UserModel.findById(userId);
        const requester = await UserModel.findById(contact.userId);

        if (respondent && requester) {
            // Check if reciprocal contact already exists for target user pointing back to requester
            const reciprocal = await this.contactRepository.findContactByUsers(
                userId,
                requester._id.toString()
            );

            if (!reciprocal) {
                await this.contactRepository.createContact(userId, {
                    userId: respondent._id,
                    targetUserId: requester._id,
                    name: `${requester.firstName} ${requester.lastName}`,
                    phoneNumber: requester.phoneNumber || contact.phoneNumber,
                    relation: "Trusted Contact",
                    status: "accepted",
                    avatarUrl: requester.profilePicture,
                    isEmergencyContact: true,
                    isPrimary: false,
                });
            } else {
                reciprocal.status = "accepted";
                await reciprocal.save();
            }

            // Create notification & emit socket event for requester
            const notif = await NotificationModel.create({
                userId: contact.userId,
                senderId: userId as any,
                title: "Trusted Contact Request Accepted",
                message: `${respondent.firstName} ${respondent.lastName} accepted your trusted contact request.`,
                type: "contact_accepted",
            });

            socketService.emitToUser(contact.userId.toString(), "trusted:accepted", {
                contactId: contact._id,
                user: {
                    _id: respondent._id,
                    name: `${respondent.firstName} ${respondent.lastName}`,
                    phoneNumber: respondent.phoneNumber,
                    avatarUrl: respondent.profilePicture,
                },
            });

            // Also notify the accepting user's device to refresh contacts list
            socketService.emitToUser(userId, "trusted:accepted", {
                contactId: contact._id,
            });

            socketService.emitToUser(contact.userId.toString(), "notification:new", notif);
        }

        return contact;
    }

    async getContactById(userId: string, contactId: string) {
        const contact = await this.contactRepository.getContactById(contactId, userId);
        if (!contact) {
            throw new HttpException(404, "Contact not found");
        }
        return contact;
    }

    async updateContact(userId: string, contactId: string, data: UpdateContactDTOType) {
        const contact = await this.contactRepository.updateContact(contactId, userId, data);
        if (!contact) {
            throw new HttpException(404, "Contact not found");
        }
        return contact;
    }

    async deleteContact(userId: string, contactId: string) {
        const contact = await this.contactRepository.deleteContact(contactId, userId);
        if (!contact) {
            throw new HttpException(404, "Contact not found");
        }

        if (contact.targetUserId) {
            socketService.emitToUser(contact.targetUserId.toString(), "trusted:removed", {
                contactId: contact._id,
                removedBy: userId,
            });
        }

        return true;
    }
}


