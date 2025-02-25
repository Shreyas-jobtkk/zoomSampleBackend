import express from "express";
import * as callLogController from "../controllers/callLogController";

const router = express.Router();

// router.put("/:company_no", callLogController.updateCompany); // Update a company
// router.get("/names", callLogController.getCompanyNames);
// router.get("/:company_no", callLogController.getCompany); // Get a single company by ID
router.post("/", callLogController.createCallLog); // Create a new company
// router.delete("/", callLogController.deleteCompanies); // Delete companies
router.get("/", callLogController.getCallLogData); // Get all companies

export default router;
