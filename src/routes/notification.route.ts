import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const notificationRouter = Router();
const notificationController = new NotificationController();

/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 50
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
notificationRouter.get(
    "/",
    authorizedMiddleware,
    notificationController.getNotifications.bind(notificationController)
);

/**
 * @openapi
 * /api/v1/notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *       401:
 *         description: Unauthorized
 */
notificationRouter.get(
    "/unread-count",
    authorizedMiddleware,
    notificationController.getUnreadCount.bind(notificationController)
);

/**
 * @openapi
 * /api/v1/notifications/mark-read:
 *   put:
 *     summary: Mark notifications as read
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationIds
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *       401:
 *         description: Unauthorized
 */
notificationRouter.put(
    "/mark-read",
    authorizedMiddleware,
    notificationController.markAsRead.bind(notificationController)
);

/**
 * @openapi
 * /api/v1/notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
notificationRouter.put(
    "/mark-all-read",
    authorizedMiddleware,
    notificationController.markAllAsRead.bind(notificationController)
);

/**
 * @openapi
 * /api/v1/notifications/{notificationId}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
notificationRouter.delete(
    "/:notificationId",
    authorizedMiddleware,
    notificationController.deleteNotification.bind(notificationController)
);

export default notificationRouter;
