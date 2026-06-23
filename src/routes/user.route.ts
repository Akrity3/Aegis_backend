import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { upload } from "../middlewares/upload.middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/", userController.createUser.bind(userController));
userRouter.post("/login", userController.loginUser.bind(userController));
userRouter.get(
    "/:id",
    authorizedMiddleware,
    userController.getUserById.bind(userController)
);
userRouter.post(
    "/profile-picture",
    authorizedMiddleware,
    upload.single("profilePicture"),
    userController.uploadProfilePicture.bind(userController)
);

export default userRouter;
