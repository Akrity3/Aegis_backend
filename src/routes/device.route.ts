import { Router } from "express";
import { DeviceController } from "../controllers/device.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const deviceRouter = Router();
const deviceController = new DeviceController();

/**
 * @openapi
 * /api/v1/devices/register:
 *   post:
 *     summary: Register device for push notifications
 *     tags: [Devices]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - platform
 *             properties:
 *               token:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *               deviceName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device registered successfully
 *       401:
 *         description: Unauthorized
 */
deviceRouter.post(
    "/register",
    authorizedMiddleware,
    deviceController.registerDevice.bind(deviceController)
);

/**
 * @openapi
 * /api/v1/devices:
 *   get:
 *     summary: Get user's devices
 *     tags: [Devices]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Devices retrieved successfully
 *       401:
 *         description: Unauthorized
 */
deviceRouter.get(
    "/",
    authorizedMiddleware,
    deviceController.getMyDevices.bind(deviceController)
);

/**
 * @openapi
 * /api/v1/devices/remove:
 *   delete:
 *     summary: Remove device
 *     tags: [Devices]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *             properties:
 *               deviceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device removed successfully
 *       401:
 *         description: Unauthorized
 */
deviceRouter.delete(
    "/remove",
    authorizedMiddleware,
    deviceController.removeDevice.bind(deviceController)
);

export default deviceRouter;
