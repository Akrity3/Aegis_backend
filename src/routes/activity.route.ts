import { Router } from "express";
import { ActivityController } from "../controllers/activity.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const activityRouter = Router();
const activityController = new ActivityController();

/**
 * @openapi
 * /api/v1/activities:
 *   get:
 *     summary: Get user's activities
 *     tags: [Activities]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 100
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *       401:
 *         description: Unauthorized
 */
activityRouter.get(
    "/",
    authorizedMiddleware,
    activityController.getActivities.bind(activityController)
);

/**
 * @openapi
 * /api/v1/activities/type/{type}:
 *   get:
 *     summary: Get activities by type
 *     tags: [Activities]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [login, logout, profile_updated, password_changed, contact_added, contact_updated, contact_deleted, alert_triggered, alert_resolved, incident_reported, notification_read, settings_updated]
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 50
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *       401:
 *         description: Unauthorized
 */
activityRouter.get(
    "/type/:type",
    authorizedMiddleware,
    activityController.getActivitiesByType.bind(activityController)
);

/**
 * @openapi
 * /api/v1/activities/date-range:
 *   get:
 *     summary: Get activities by date range
 *     tags: [Activities]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 100
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *       401:
 *         description: Unauthorized
 */
activityRouter.get(
    "/date-range",
    authorizedMiddleware,
    activityController.getActivitiesByDateRange.bind(activityController)
);

export default activityRouter;
