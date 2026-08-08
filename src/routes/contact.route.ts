import { Router } from "express";
import { ContactController } from "../controllers/contact.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const contactRouter = Router();
const contactController = new ContactController();

/**
 * @openapi
 * /api/v1/contacts:
 *   post:
 *     summary: Add emergency contact
 *     tags: [Contacts]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               relation:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Contact added successfully
 *       401:
 *         description: Unauthorized
 */
contactRouter.post("/", authorizedMiddleware, contactController.addContact.bind(contactController));

/**
 * @openapi
 * /api/v1/contacts/pending:
 *   get:
 *     summary: Get incoming pending contact requests
 *     tags: [Contacts]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Pending requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */
contactRouter.get("/pending", authorizedMiddleware, contactController.getPendingRequests.bind(contactController));

/**
 * @openapi
 * /api/v1/contacts:
 *   get:
 *     summary: Get user's contacts
 *     tags: [Contacts]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
contactRouter.get("/", authorizedMiddleware, contactController.getContacts.bind(contactController));

/**
 * @openapi
 * /api/v1/contacts/{id}/status:
 *   put:
 *     summary: Respond to pending contact request (accept or reject)
 *     tags: [Contacts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Contact request responded successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
contactRouter.put("/:id/status", authorizedMiddleware, contactController.respondToRequest.bind(contactController));

/**
 * @openapi
 * /api/v1/contacts/{id}:
 *   put:
 *     summary: Update contact
 *     tags: [Contacts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               relation:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact not found
 */
contactRouter.put("/:id", authorizedMiddleware, contactController.updateContact.bind(contactController));

/**
 * @openapi
 * /api/v1/contacts/{id}:
 *   delete:
 *     summary: Delete contact
 *     tags: [Contacts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact not found
 */
contactRouter.delete("/:id", authorizedMiddleware, contactController.deleteContact.bind(contactController));

export default contactRouter;

