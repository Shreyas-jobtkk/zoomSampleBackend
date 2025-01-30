import express from "express";
import { createMeetingController } from "../controllers/zoomController.js";

const router = express.Router();

// Define route for creating a meeting
router.post("/", createMeetingController);

export default router;
