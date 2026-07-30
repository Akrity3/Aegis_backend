import { ContactRepository } from "../repositories/contact.repository";
import { CreateContactDTOType, UpdateContactDTOType } from "../dtos/contact.dto";
import { HttpException } from "../exceptions/http-exception";

export class ContactService {
    private contactRepository: ContactRepository;

    constructor() {
        this.contactRepository = new ContactRepository();
    }

    async addContact(userId: string, data: CreateContactDTOType) {
        try {
            return await this.contactRepository.createContact(userId, data);
        } catch (error: any) {
            if (error.code === 11000) {
                throw new HttpException(400, "This phone number is already in your contacts");
            }
            throw error;
        }
    }

    async getContacts(userId: string, page: number = 1, limit: number = 10, sort: string = "name") {
        return await this.contactRepository.getContactsByUserId(userId, page, limit, sort);
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
        const success = await this.contactRepository.deleteContact(contactId, userId);
        if (!success) {
            throw new HttpException(404, "Contact not found");
        }
        return true;
    }
}
