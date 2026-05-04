import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//  HEALTHCHECK
//  → Returns 200 OK with server and DB status
const healthcheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    status: "OK",
                    message: "Server is up and running",
                    timestamp: new Date().toISOString(),
                    uptime: `${Math.floor(process.uptime())}s`,
                },
                "Healthcheck passed"
            )
        );
});


export { healthcheck };
    