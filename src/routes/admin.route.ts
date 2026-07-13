import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import {
    authorizedMiddleware,
    adminMiddleware,
} from "../middlewares/authorized.middleware";

const adminRouter = Router();
const adminController = new AdminController();

// All admin routes require authentication + admin role
adminRouter.use(authorizedMiddleware, adminMiddleware);

adminRouter.get(
    "/users",
    adminController.getUsers.bind(adminController)
);

adminRouter.get(
    "/users/:id",
    adminController.getUserById.bind(adminController)
);

adminRouter.post(
    "/users",
    adminController.createUser.bind(adminController)
);

adminRouter.patch(
    "/users/:id",
    adminController.updateUser.bind(adminController)
);

adminRouter.delete(
    "/users/:id",
    adminController.deleteUser.bind(adminController)
);

adminRouter.get(
    "/stats",
    adminController.getStats.bind(adminController)
);

export default adminRouter;
