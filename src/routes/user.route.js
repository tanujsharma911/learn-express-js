import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// localhost:3000/api/users/register
router.route("/register").post(registerUser);


export default router;