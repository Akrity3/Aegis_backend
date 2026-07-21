import { Router } from "express";
import { AlertController } from "../controllers/alert.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const alertController = new AlertController();

router.get("/my", authorizedMiddleware, alertController.getMyAlerts.bind(alertController));
router.post("/trigger", authorizedMiddleware, alertController.triggerAlert.bind(alertController));
router.put("/resolve/:id", authorizedMiddleware, alertController.resolveAlert.bind(alertController));

export default router;
