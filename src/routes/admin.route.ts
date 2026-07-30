import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { SettingsController } from "../controllers/settings.controller";
import { AuditLogController } from "../controllers/auditLog.controller";
import {
    authorizedMiddleware,
    adminMiddleware,
} from "../middlewares/authorized.middleware";

const adminRouter = Router();
const adminController = new AdminController();
const settingsController = new SettingsController();
const auditLogController = new AuditLogController();

// All admin routes require authentication + admin role
adminRouter.use(authorizedMiddleware, adminMiddleware);

/**
 * @openapi
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/dashboard",
    adminController.getDashboard.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/users",
    adminController.getUsers.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get user by ID (admin)
 *     tags: [Admin]
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
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: User not found
 */
adminRouter.get(
    "/users/:id",
    adminController.getUserById.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/users:
 *   post:
 *     summary: Create user (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               phoneNumber:
 *                 type: string
 *               gender:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.post(
    "/users",
    adminController.createUser.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   patch:
 *     summary: Update user (admin)
 *     tags: [Admin]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               phoneNumber:
 *                 type: string
 *               gender:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: User not found
 */
adminRouter.patch(
    "/users/:id",
    adminController.updateUser.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete user (admin)
 *     tags: [Admin]
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
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: User not found
 */
adminRouter.delete(
    "/users/:id",
    adminController.deleteUser.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get user statistics (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/stats",
    adminController.getStats.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/incidents:
 *   get:
 *     summary: Get all incidents (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, verified, rejected]
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Incidents retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/incidents",
    adminController.getIncidents.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/incidents/{id}:
 *   get:
 *     summary: Get incident by ID (admin)
 *     tags: [Admin]
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
 *         description: Incident retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Incident not found
 */
adminRouter.get(
    "/incidents/:id",
    adminController.getIncidentById.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/incidents/{id}:
 *   patch:
 *     summary: Update incident (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, verified, rejected]
 *     responses:
 *       200:
 *         description: Incident updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Incident not found
 */
adminRouter.patch(
    "/incidents/:id",
    adminController.updateIncident.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/incidents/{id}:
 *   delete:
 *     summary: Delete incident (admin)
 *     tags: [Admin]
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
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Incident not found
 */
adminRouter.delete(
    "/incidents/:id",
    adminController.deleteIncident.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/alerts:
 *   get:
 *     summary: Get all alerts (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, resolved]
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/alerts",
    adminController.getAlerts.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/alerts/{id}:
 *   get:
 *     summary: Get alert by ID (admin)
 *     tags: [Admin]
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
 *         description: Alert retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Alert not found
 */
adminRouter.get(
    "/alerts/:id",
    adminController.getAlertById.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/alerts/{id}/resolve:
 *   patch:
 *     summary: Resolve alert (admin)
 *     tags: [Admin]
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
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Alert not found
 */
adminRouter.patch(
    "/alerts/:id/resolve",
    adminController.resolveAlert.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/activities:
 *   get:
 *     summary: Get all activities (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/activities",
    adminController.getActivities.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/analytics:
 *   get:
 *     summary: Get analytics data (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/analytics",
    adminController.getAnalytics.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/settings:
 *   get:
 *     summary: Get admin settings
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/settings",
    settingsController.getSettings.bind(settingsController)
);

/**
 * @openapi
 * /api/v1/admin/settings:
 *   patch:
 *     summary: Update admin settings
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maintenanceMode:
 *                 type: boolean
 *               registrationEnabled:
 *                 type: boolean
 *               emailVerificationRequired:
 *                 type: boolean
 *               maxUsersPerSafetyCircle:
 *                 type: number
 *               sosAlertCooldown:
 *                 type: number
 *               incidentAutoVerify:
 *                 type: boolean
 *               defaultSearchRadius:
 *                 type: number
 *               notificationSettings:
 *                 type: object
 *                 properties:
 *                   emailEnabled:
 *                     type: boolean
 *                   pushEnabled:
 *                     type: boolean
 *                   smsEnabled:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.patch(
    "/settings",
    settingsController.updateSettings.bind(settingsController)
);

/**
 * @openapi
 * /api/v1/admin/audit-logs:
 *   get:
 *     summary: Get audit logs (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: adminId
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: targetType
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/audit-logs",
    auditLogController.getAuditLogs.bind(auditLogController)
);

/**
 * @openapi
 * /api/v1/admin/audit-logs/stats:
 *   get:
 *     summary: Get audit log statistics (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Audit log statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
adminRouter.get(
    "/audit-logs/stats",
    auditLogController.getAuditLogStats.bind(auditLogController)
);

export default adminRouter;
