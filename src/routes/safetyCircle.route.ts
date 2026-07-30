import { Router } from "express";
import { SafetyCircleController } from "../controllers/safetyCircle.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const safetyCircleRouter = Router();
const safetyCircleController = new SafetyCircleController();

/**
 * @openapi
 * /api/v1/safety-circle:
 *   post:
 *     summary: Add contact to safety circle
 *     tags: [Safety Circle]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactId
 *             properties:
 *               contactId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact added to safety circle
 *       401:
 *         description: Unauthorized
 */
safetyCircleRouter.post(
    "/",
    authorizedMiddleware,
    safetyCircleController.addToSafetyCircle.bind(safetyCircleController)
);

/**
 * @openapi
 * /api/v1/safety-circle:
 *   get:
 *     summary: Get safety circle members
 *     tags: [Safety Circle]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Safety circle members retrieved successfully
 *       401:
 *         description: Unauthorized
 */
safetyCircleRouter.get(
    "/",
    authorizedMiddleware,
    safetyCircleController.getSafetyCircle.bind(safetyCircleController)
);

/**
 * @openapi
 * /api/v1/safety-circle/{circleId}/status:
 *   put:
 *     summary: Update safety circle member status
 *     tags: [Safety Circle]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: circleId
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
 *                 enum: [active, inactive, pending]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
safetyCircleRouter.put(
    "/:circleId/status",
    authorizedMiddleware,
    safetyCircleController.updateStatus.bind(safetyCircleController)
);

/**
 * @openapi
 * /api/v1/safety-circle/{circleId}/location:
 *   put:
 *     summary: Update safety circle member location
 *     tags: [Safety Circle]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: circleId
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
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
safetyCircleRouter.put(
    "/:circleId/location",
    authorizedMiddleware,
    safetyCircleController.updateLocation.bind(safetyCircleController)
);

/**
 * @openapi
 * /api/v1/safety-circle/{circleId}:
 *   delete:
 *     summary: Remove contact from safety circle
 *     tags: [Safety Circle]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: circleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact removed from safety circle
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
safetyCircleRouter.delete(
    "/:circleId",
    authorizedMiddleware,
    safetyCircleController.removeFromSafetyCircle.bind(safetyCircleController)
);

export default safetyCircleRouter;
