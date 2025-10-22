import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middle.js";

const router = Router();

// localhost:3000/api/users/register
router.route("/register").post(
    upload.fields([    // middleware to handle multiple file uploads
        { name: "avatar", maxCount: 1 }, 
        { name: "coverImage", maxCount: 1 }
    ]), 
    
    registerUser  // controller to handle user registration, executes after file upload
);


export default router;