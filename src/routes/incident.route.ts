import { Router } from "express";
import { IncidentController } from "../controllers/incident.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { upload } from "../middlewares/upload.middleware";

const incidentRouter = Router();
const incidentController = new IncidentController();

// POST   /api/v1/incidents
// Authenticated. Accepts optional photo via multipart form-data field "photo".
incidentRouter.post(
    "/",
    authorizedMiddleware,
    upload.single("photo"),
    incidentController.createIncident.bind(incidentController)
);

// GET    /api/v1/incidents/my
// Authenticated. Returns the current user's full incident history.
incidentRouter.get(
    "/my",
    authorizedMiddleware,
    incidentController.getMyIncidents.bind(incidentController)
);

// GET    /api/v1/incidents/public
// Public (no auth). Returns community-safe incident data for Safety Map / feed.
incidentRouter.get(
    "/public",
    incidentController.getPublicIncidents.bind(incidentController)
);

export default incidentRouter;
