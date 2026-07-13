import { ContactModel, IContact } from "../models/contact.model";
import { CreateContactDTOType, UpdateContactDTOType } from "../dtos/contact.dto";

export class ContactRepository {
    async createContact(userId: string, data: CreateContactDTOType): Promise<IContact> {
        const contact = new ContactModel({ ...data, userId });
        return await contact.save();
    }

    async getContactsByUserId(userId: string): Promise<IContact[]> {
        return await ContactModel.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });
    }

    async getContactById(contactId: string, userId: string): Promise<IContact | null> {
        return await ContactModel.findOne({ _id: contactId, userId });
    }

    async updateContact(contactId: string, userId: string, data: UpdateContactDTOType): Promise<IContact | null> {
        return await ContactModel.findOneAndUpdate(
            { _id: contactId, userId },
            data,
            { new: true, runValidators: true }
        );
    }

    async deleteContact(contactId: string, userId: string): Promise<boolean> {
        const result = await ContactModel.deleteOne({ _id: contactId, userId });
        return result.deletedCount === 1;
    }
}
