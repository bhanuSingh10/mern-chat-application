import { Router } from "express";
import {
  getUserInfo,
  login,
  signup,
  updateProfile,
  addProfileImage,
  removeProfileImage,
  logOut
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";

const route = Router();
const upload = multer({ dest: "uploads/profiles/" });

route.post("/signup", signup);
route.post("/login", login);
route.get("/user-info", verifyToken, getUserInfo);
route.post("/update-profile", verifyToken, updateProfile);
route.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage
);
route.delete("/remove-profile-image", verifyToken, removeProfileImage);
route.post("/logout", logOut);

export default route;
