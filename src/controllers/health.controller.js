
import { ApiResponse } from '../utils/ApiResponse.js';

const healthChecker = (req, res) => {
    res.status(200).json(new ApiResponse(200, "Every thing is working ✅"));
}

export { healthChecker }