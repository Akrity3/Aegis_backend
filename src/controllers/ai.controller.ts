import { Request, Response, NextFunction } from "express";
import { AiService } from "../services/ai.service";
import { HttpException } from "../exceptions/http-exception";

const aiService = new AiService();

export class AiController {
    /**
     * POST /api/v1/ai/chat
     * Accepts a user message and returns a safety-focused AI response.
     */
    async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { message } = req.body;

            if (!message || typeof message !== "string" || message.trim().length === 0) {
                throw new HttpException(400, "message is required and must be a non-empty string.");
            }

            if (message.length > 500) {
                throw new HttpException(400, "message must not exceed 500 characters.");
            }

            const reply = await aiService.getChatResponse(message.trim());

            res.status(200).json({
                success: true,
                reply,
            });
        } catch (err) {
            next(err);
        }
    }
}
