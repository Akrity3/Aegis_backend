import { Router } from "express";
import { ActivityController } from "../controllers/activity.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const activityRouter = Router();
const activityController = new ActivityController();

// GET    /api/v1/activities
// Authenticated. Returns the current user's activity history.
activityRouter.get(
    "/",
    authorizedMiddleware,
    activityController.getActivities.bind(activityController)
);

// GET    /api/v1/activities/type/:type
// Authenticated. Returns activities filtered by type.
activityRouter.get(
    "/type/:type",
    authorizedMiddleware,
    activityController.getActivitiesByType.bind(activityController)
);

// GET    /api/v1/activities/date-range
// Authenticated. Returns activities within a date range.
activityRouter.get(
    "/date-range",
    authorizedMiddleware,
    activityController.getActivitiesByDateRange.bind(activityController)
);

export default activityRouter;
