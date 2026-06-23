import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { upload } from "../middlewares/upload.middleware";

const authRouter = Router();
const userController = new UserController();

authRouter.post("/register", userController.createUser.bind(userController));
authRouter.post("/login", userController.loginUser.bind(userController));
authRouter.get("/whoami", authorizedMiddleware, userController.whoami.bind(userController));
authRouter.post("/update", authorizedMiddleware, upload.single("profilePicture"), userController.updateProfile.bind(userController));

export default authRouter;
