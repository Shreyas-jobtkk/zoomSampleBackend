import express from "express";
import * as callLogController from "../controllers/callLogController";

const router = express.Router();

// Route to create a new call log entry
router.post("/", callLogController.createCallLogController);

// Route to get all call logs
router.get("/", callLogController.getAllCallLogsController);

export default router;
