import { ContactModel, IContact, ContactStatus } from "../models/contact.model";
import { CreateContactDTOType, UpdateContactDTOType } from "../dtos/contact.dto";

export class ContactRepository {
    async createContact(userId: string, data: Partial<IContact>): Promise<IContact> {
        const contact = new ContactModel({ ...data, userId });
        return await contact.save();
    }

    async getContactsByUserId(
        userId: string,
        page: number = 1,
        limit: number = 50,
        sort: string = "name",
        status?: ContactStatus
    ): Promise<{ data: IContact[], meta: { page: number, limit: number, total: number, totalPages: number } }> {
        const skip = (page - 1) * limit;
        const query: any = { userId };
        if (status) {
            query.status = status;
        }

        const total = await ContactModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        let sortObj: any = {};
        if (sort === "name") {
            sortObj = { name: 1 };
        } else if (sort === "createdAt") {
            sortObj = { createdAt: -1 };
        } else {
            sortObj = { isPrimary: -1, createdAt: -1 };
        }

        const data = await ContactModel.find(query)
            .populate("targetUserId", "firstName lastName email phoneNumber profilePicture")
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    async getPendingRequestsForUser(userId: string): Promise<IContact[]> {
        return await ContactModel.find({ targetUserId: userId, status: "pending" })
            .populate("userId", "firstName lastName email phoneNumber profilePicture")
            .sort({ createdAt: -1 });
    }

    async getContactById(contactId: string, userId?: string): Promise<IContact | null> {
        const query: any = { _id: contactId };
        if (userId) query.userId = userId;
        return await ContactModel.findOne(query).populate("targetUserId", "firstName lastName email phoneNumber profilePicture");
    }

    async findContactByUsers(userId: string, targetUserId: string): Promise<IContact | null> {
        return await ContactModel.findOne({ userId, targetUserId });
    }

    async updateContact(contactId: string, userId: string, data: Partial<IContact>): Promise<IContact | null> {
        return await ContactModel.findOneAndUpdate(
            { _id: contactId, userId },
            data,
            { new: true, runValidators: true }
        ).populate("targetUserId", "firstName lastName email phoneNumber profilePicture");
    }

    async updateContactStatus(contactId: string, status: ContactStatus): Promise<IContact | null> {
        return await ContactModel.findByIdAndUpdate(
            contactId,
            { status },
            { new: true }
        );
    }

    async deleteContact(contactId: string, userId: string): Promise<IContact | null> {
        const contact = await ContactModel.findOne({ _id: contactId, userId });
        if (!contact) return null;
        
        // Delete contact
        await ContactModel.deleteOne({ _id: contactId });

        // If it was accepted and has targetUserId, remove reciprocal contact as well
        if (contact.targetUserId) {
            await ContactModel.deleteOne({ userId: contact.targetUserId, targetUserId: userId });
        }

        return contact;
    }
}

