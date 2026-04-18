import { Router } from "express";
import { resisterUser } from "../controllers/user.controller.js";

const router = Router();


router.route("/resister").post(resisterUser)

export default router