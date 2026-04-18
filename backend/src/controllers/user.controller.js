import {asyncHandler} from '../utils/asyncHandler.js';

const resisterUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        massage: "ok"
    })
})


export {resisterUser}