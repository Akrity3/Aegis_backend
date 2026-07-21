import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const notificationRouter = Router();
const notificationController = new NotificationController();

// GET    /api/v1/notifications
// Authenticated. Returns the current user's notifications.
notificationRouter.get(
    "/",
    authorizedMiddleware,
    notificationController.getNotifications.bind(notificationController)
);

// GET    /api/v1/notifications/unread-count
// Authenticated. Returns the count of unread notifications.
notificationRouter.get(
    "/unread-count",
    authorizedMiddleware,
    notificationController.getUnreadCount.bind(notificationController)
);

// PUT    /api/v1/notifications/mark-read
// Authenticated. Marks specified notifications as read.
notificationRouter.put(
    "/mark-read",
    authorizedMiddleware,
    notificationController.markAsRead.bind(notificationController)
);

// PUT    /api/v1/notifications/mark-all-read
// Authenticated. Marks all notifications as read.
notificationRouter.put(
    "/mark-all-read",
    authorizedMiddleware,
    notificationController.markAllAsRead.bind(notificationController)
);

// DELETE /api/v1/notifications/:notificationId
// Authenticated. Deletes a specific notification.
notificationRouter.delete(
    "/:notificationId",
    authorizedMiddleware,
    notificationController.deleteNotification.bind(notificationController)
);

export default notificationRouter;
