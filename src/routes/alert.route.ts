import { Router } from "express";
import { AlertController } from "../controllers/alert.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const alertController = new AlertController();

/**
 * @openapi
 * /api/v1/alerts/my:
 *   get:
 *     summary: Get user's alerts
 *     tags: [Alerts]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my", authorizedMiddleware, alertController.getMyAlerts.bind(alertController));

/**
 * @openapi
 * /api/v1/alerts/active:
 *   get:
 *     summary: Get user's active SOS alert
 *     tags: [Alerts]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Active alert retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/active", authorizedMiddleware, alertController.getActiveAlert.bind(alertController));

/**
 * @openapi
 * /api/v1/alerts/active-all:
 *   get:
 *     summary: Get all active emergency alerts for map display
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: Active alerts retrieved successfully
 */
router.get("/active-all", alertController.getAllActiveAlerts.bind(alertController));

/**
 * @openapi
 * /api/v1/alerts/location:
 *   post:
 *     summary: Stream live location update during active SOS
 *     tags: [Alerts]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alertId
 *               - latitude
 *               - longitude
 *             properties:
 *               alertId:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               accuracy:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/location", authorizedMiddleware, alertController.updateLocation.bind(alertController));

/**
 * @openapi
 * /api/v1/alerts/trigger:
 *   post:
 *     summary: Trigger SOS alert
 *     tags: [Alerts]
 *     security:
 *       - cookieAuth: []
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
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alert triggered successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/trigger", authorizedMiddleware, alertController.triggerAlert.bind(alertController));

/**
 * @openapi
 * /api/v1/alerts/resolve/{id}:
 *   put:
 *     summary: Resolve alert
 *     tags: [Alerts]
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
 *         description: Alert resolved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Alert not found
 */
router.put("/resolve/:id", authorizedMiddleware, alertController.resolveAlert.bind(alertController));

export default router;

