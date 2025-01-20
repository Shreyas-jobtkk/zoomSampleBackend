import express from "express";
import * as companyController from "../controllers/companyController.js";

const router = express.Router();

router.put("/:company_no", companyController.updateCompany); // Update a company
router.get("/names", companyController.getCompanyNames);
router.get("/:company_no", companyController.getCompany); // Get a single company by ID
router.post("/", companyController.createCompany); // Create a new company
router.delete("/", companyController.deleteCompanies); // Delete companies
router.get("/", companyController.getCompanies); // Get all companies

export default router;
