import { Router } from "express";
import { SafetyCircleController } from "../controllers/safetyCircle.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const safetyCircleRouter = Router();
const safetyCircleController = new SafetyCircleController();

// POST   /api/v1/safety-circle
// Authenticated. Add a contact to the safety circle.
safetyCircleRouter.post(
    "/",
    authorizedMiddleware,
    safetyCircleController.addToSafetyCircle.bind(safetyCircleController)
);

// GET    /api/v1/safety-circle
// Authenticated. Get all safety circle members.
safetyCircleRouter.get(
    "/",
    authorizedMiddleware,
    safetyCircleController.getSafetyCircle.bind(safetyCircleController)
);

// PUT    /api/v1/safety-circle/:circleId/status
// Authenticated. Update safety circle member status.
safetyCircleRouter.put(
    "/:circleId/status",
    authorizedMiddleware,
    safetyCircleController.updateStatus.bind(safetyCircleController)
);

// PUT    /api/v1/safety-circle/:circleId/location
// Authenticated. Update last location of a safety circle member.
safetyCircleRouter.put(
    "/:circleId/location",
    authorizedMiddleware,
    safetyCircleController.updateLocation.bind(safetyCircleController)
);

// DELETE /api/v1/safety-circle/:circleId
// Authenticated. Remove a contact from safety circle.
safetyCircleRouter.delete(
    "/:circleId",
    authorizedMiddleware,
    safetyCircleController.removeFromSafetyCircle.bind(safetyCircleController)
);

export default safetyCircleRouter;
