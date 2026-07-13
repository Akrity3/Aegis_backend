import { Router } from "express";
import { ContactController } from "../controllers/contact.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const contactRouter = Router();
const contactController = new ContactController();

contactRouter.post("/", authorizedMiddleware, contactController.addContact.bind(contactController));
contactRouter.get("/", authorizedMiddleware, contactController.getContacts.bind(contactController));
contactRouter.put("/:id", authorizedMiddleware, contactController.updateContact.bind(contactController));
contactRouter.delete("/:id", authorizedMiddleware, contactController.deleteContact.bind(contactController));

export default contactRouter;
