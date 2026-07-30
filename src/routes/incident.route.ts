import { Router } from "express";
import { IncidentController } from "../controllers/incident.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { upload } from "../middlewares/upload.middleware";

const incidentRouter = Router();
const incidentController = new IncidentController();

/**
 * @openapi
 * /api/v1/incidents:
 *   post:
 *     summary: Create incident report
 *     tags: [Incidents]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - description
 *               - latitude
 *               - longitude
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [Harassment, Road Accident, Theft / Robbery, Suspicious Activity, Natural Disaster, Fire Emergency, Unsafe Infrastructure / Road Hazard, Other]
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               address:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Incident created successfully
 *       401:
 *         description: Unauthorized
 */
incidentRouter.post(
    "/",
    authorizedMiddleware,
    upload.single("photo"),
    incidentController.createIncident.bind(incidentController)
);

/**
 * @openapi
 * /api/v1/incidents/my:
 *   get:
 *     summary: Get user's incidents
 *     tags: [Incidents]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Incidents retrieved successfully
 *       401:
 *         description: Unauthorized
 */
incidentRouter.get(
    "/my",
    authorizedMiddleware,
    incidentController.getMyIncidents.bind(incidentController)
);

/**
 * @openapi
 * /api/v1/incidents/public:
 *   get:
 *     summary: Get public incidents
 *     tags: [Incidents]
 *     responses:
 *       200:
 *         description: Public incidents retrieved successfully
 */
incidentRouter.get(
    "/public",
    incidentController.getPublicIncidents.bind(incidentController)
);

/**
 * @openapi
 * /api/v1/incidents/{id}:
 *   put:
 *     summary: Update incident
 *     tags: [Incidents]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               address:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Incident updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Incident not found
 */
incidentRouter.put(
    "/:id",
    authorizedMiddleware,
    upload.single("photo"),
    incidentController.updateIncident.bind(incidentController)
);

/**
 * @openapi
 * /api/v1/incidents/{id}:
 *   delete:
 *     summary: Delete incident
 *     tags: [Incidents]
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
 *         description: Incident deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Incident not found
 */
incidentRouter.delete(
    "/:id",
    authorizedMiddleware,
    incidentController.deleteIncident.bind(incidentController)
);

/**
 * @openapi
 * /api/v1/incidents/nearby:
 *   get:
 *     summary: Get nearby incidents
 *     tags: [Incidents]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Nearby incidents retrieved successfully
 */
incidentRouter.get(
    "/nearby",
    incidentController.getNearbyIncidents.bind(incidentController)
);

/**
 * @openapi
 * /api/v1/incidents/risk-zones:
 *   get:
 *     summary: Get risk zones
 *     tags: [Incidents]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Risk zones retrieved successfully
 */
incidentRouter.get(
    "/risk-zones",
    incidentController.getRiskZones.bind(incidentController)
);

export default incidentRouter;
