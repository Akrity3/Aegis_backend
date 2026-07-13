import { Request, Response } from "express";
import { CreateContactDTO, UpdateContactDTO } from "../dtos/contact.dto";
import { ContactService } from "../services/contact.service";
import { z } from "zod";

const contactService = new ContactService();

export class ContactController {
    async addContact(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const parsedData = CreateContactDTO.safeParse(req.body);
            if (!parsedData.success) {
                const message = parsedData.error.errors.map(e => e.message).join(', ');
                return res.status(400).json({ message });
            }

            const contact = await contactService.addContact(String(req.user._id), parsedData.data);

            return res.status(201).json({
                success: true,
                data: contact,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getContacts(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const contacts = await contactService.getContacts(String(req.user._id));

            return res.status(200).json({
                success: true,
                data: contacts,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async updateContact(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const contactId = String(req.params.id);
            const parsedData = UpdateContactDTO.safeParse(req.body);
            
            if (!parsedData.success) {
                const message = parsedData.error.errors.map(e => e.message).join(', ');
                return res.status(400).json({ message });
            }

            const contact = await contactService.updateContact(String(req.user._id), contactId, parsedData.data);

            return res.status(200).json({
                success: true,
                data: contact,
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }

    async deleteContact(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ message: "Not authorized" });
            }

            const contactId = String(req.params.id);
            await contactService.deleteContact(String(req.user._id), contactId);

            return res.status(200).json({
                success: true,
                message: "Contact deleted successfully",
            });
        } catch (error: any) {
            return res.status(error.status || error.statusCode || 500).json({
                message: error.message || "Internal Server Error",
            });
        }
    }
}
