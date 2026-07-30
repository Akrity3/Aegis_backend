import { ContactModel, IContact } from "../models/contact.model";
import { CreateContactDTOType, UpdateContactDTOType } from "../dtos/contact.dto";

export class ContactRepository {
    async createContact(userId: string, data: CreateContactDTOType): Promise<IContact> {
        const contact = new ContactModel({ ...data, userId });
        return await contact.save();
    }

    async getContactsByUserId(userId: string, page: number = 1, limit: number = 10, sort: string = "name"): Promise<{ data: IContact[], meta: { page: number, limit: number, total: number, totalPages: number } }> {
        const skip = (page - 1) * limit;
        const total = await ContactModel.countDocuments({ userId });
        const totalPages = Math.ceil(total / limit);
        
        let sortObj: any = {};
        if (sort === "name") {
            sortObj = { name: 1 };
        } else if (sort === "createdAt") {
            sortObj = { createdAt: -1 };
        } else {
            sortObj = { isPrimary: -1, createdAt: -1 };
        }

        const data = await ContactModel.find({ userId })
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
