import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    uploadVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from '../middlewares/multer.middle.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.route("/").get(getAllVideos);

router.route("/").post(
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },

    ]),
    uploadVideo
);

router.route("/:videoId").get(getVideoById)

router.route("/:videoId").delete(verifyJWT, deleteVideo)


export default router