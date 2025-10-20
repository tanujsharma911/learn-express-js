import asyncHandler from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req, res, next) => {

    // Simulate user registration
    const newUser = {
        id: Date.now(),
        name: req.body.name,
        email: req.body.email
    };

    res.status(201).json({
        success: true,
        data: newUser
    });
});

export { registerUser }