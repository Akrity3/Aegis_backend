import { Router } from "express";
import { AiController } from "../controllers/ai.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const aiRouter = Router();
const aiController = new AiController();

/**
 * @openapi
 * /api/v1/ai/chat:
 *   post:
 *     summary: Get a safety-focused AI response
 *     tags: [AI Assistant]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 example: "What should I do in an earthquake?"
 *     responses:
 *       200:
 *         description: AI reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reply:
 *                   type: string
 *       400:
 *         description: Bad request – missing or invalid message
 *       401:
 *         description: Unauthorized
 */
aiRouter.post("/chat", authorizedMiddleware, (req, res, next) => aiController.chat(req, res, next));

export default aiRouter;
