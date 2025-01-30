import express from "express";
import { createMeetingController } from "../controllers/zoomController.js";

const router = express.Router();

console.log(456);

// Define route for creating a meeting
router.post("/", createMeetingController);

export default router;
