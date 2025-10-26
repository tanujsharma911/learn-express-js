import { Router } from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getChannalDetails,
    getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middle.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// localhost:3000/api/users/register
router.route("/register").post(
    upload.fields([    // middleware to handle multiple file uploads
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),

    registerUser  // controller to handle user registration, executes after file upload
);

// localhost:3000/api/users/login
router.route("/login").post(loginUser);

// localhost:3000/api/users/logout
router.route("/logout").post(verifyJWT, logoutUser);

// localhost:3000/api/users/refresh-token
router.route("/refresh-token").post(refreshAccessToken);

// localhost:3000/api/users/change-password
router.route("/change-password").post(verifyJWT, changePassword);

// localhost:3000/api/users/get-user
router.route("/get-user").get(verifyJWT, getUser);

router.route("/update-user-details").patch(verifyJWT, updateUserDetails);

router.route("/update-user-avatar").patch(
    verifyJWT, 
    upload.single("avatar"),
    updateUserAvatar
);

router.route("/update-user-coverimage").patch(
    verifyJWT, 
    upload.single("coverimage"),
    updateUserCoverImage
);

// get channel info
router.route("/c/:username").get(verifyJWT, getChannalDetails);

// get your watch history
router.route("/get-watchhistory").get(verifyJWT, getWatchHistory);

export default router;