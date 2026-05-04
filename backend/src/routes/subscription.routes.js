import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers) // GET  → who subscribed TO this channel?
    .post(toggleSubscription);      // POST → subscribe / unsubscribe

router
    .route("/u/:subscriberId")
    .get(getSubscribedChannels);    // GET  → which channels has this user subscribed to?

export default router;