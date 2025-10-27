import { Router } from "express";

import { healthChecker } from "../controllers/health.controller.js";

const router = Router();

router.route("/").get(healthChecker);

export default router;