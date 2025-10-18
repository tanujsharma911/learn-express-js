import { request } from "express";


const asyncHandler = (requestedFunction) => {
    (req, res, next) => {
        Promise.resolve(requestedFunction(req, res, next)).catch((err) => next(err));
    };
}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//         console.error(error);
//         next(error);
//     }
// };

export default asyncHandler;