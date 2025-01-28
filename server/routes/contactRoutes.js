import {Router} from "express";
import {verifyToken} from "../middlewares/authMiddleware.js"
import { searchContacts } from "../controllers/contactController.js";
const contactRoutes = Router();

contactRoutes.post("/search", verifyToken, searchContacts);

export default contactRoutes;