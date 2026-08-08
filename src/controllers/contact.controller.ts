import { Request, Response } from "express";
import { CreateContactDTO, UpdateContactDTO, RespondContactDTO } from "../dtos/contact.dto";
import { ContactService } from "../services/contact.service";
import { ActivityService } from "../services/activity.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { z } from "zod";
import { ContactStatus } from "../models/contact.model";

const contactService = new ContactService();
const activityService = new ActivityService();

export class ContactController {
    async addContact(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const parsedData = CreateContactDTO.safeParse(req.body);
            if (!parsedData.success) {
                const message = parsedData.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
                return ApiResponseHelper.error(res, message, 400);
            }

            const contact = await contactService.addContact(String(req.user._id), parsedData.data);

            // Log contact added activity
            await activityService.createActivity(
                String(req.user._id),
                "contact_added",
                "Contact added successfully",
                { contactId: contact._id, name: contact.name, status: contact.status },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, contact, "Contact added successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getContacts(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const page = Math.max(1, parseInt(String(req.query.page ?? 1), 10) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 50), 10) || 50));
            const sort = req.query.sort ? String(req.query.sort) : "name";
            const status = req.query.status ? (String(req.query.status) as ContactStatus) : undefined;

            const result = await contactService.getContacts(String(req.user._id), page, limit, sort, status);

            return ApiResponseHelper.success(
                res,
                result.data,
                "Contacts fetched successfully",
                200,
                result.meta
            );
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async getPendingRequests(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const requests = await contactService.getPendingRequests(String(req.user._id));
            return ApiResponseHelper.success(res, requests, "Pending contact requests retrieved successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async respondToRequest(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const contactId = String(req.params.id);
            const parsedData = RespondContactDTO.safeParse(req.body);

            if (!parsedData.success) {
                const message = parsedData.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
                return ApiResponseHelper.error(res, message, 400);
            }

            const contact = await contactService.respondToRequest(
                String(req.user._id),
                contactId,
                parsedData.data.status
            );

            await activityService.createActivity(
                String(req.user._id),
                "contact_request_responded",
                `Trusted contact request ${parsedData.data.status}`,
                { contactId, status: parsedData.data.status },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, contact, `Request ${parsedData.data.status} successfully`);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async updateContact(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const contactId = String(req.params.id);
            const parsedData = UpdateContactDTO.safeParse(req.body);
            
            if (!parsedData.success) {
                const message = parsedData.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
                return ApiResponseHelper.error(res, message, 400);
            }

            const contact = await contactService.updateContact(String(req.user._id), contactId, parsedData.data);

            // Log contact updated activity
            await activityService.createActivity(
                String(req.user._id),
                "contact_updated",
                "Contact updated successfully",
                { contactId, name: contact.name },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, contact, "Contact updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }

    async deleteContact(req: Request, res: Response) {
        try {
            if (!req.user?._id) {
                return ApiResponseHelper.error(res, "Not authorized", 401);
            }

            const contactId = String(req.params.id);
            await contactService.deleteContact(String(req.user._id), contactId);

            // Log contact deleted activity
            await activityService.createActivity(
                String(req.user._id),
                "contact_deleted",
                "Contact deleted successfully",
                { contactId },
                req.ip,
                req.headers["user-agent"]
            );

            return ApiResponseHelper.success(res, null, "Contact deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || error.statusCode || 500);
        }
    }
}

