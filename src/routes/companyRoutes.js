import express from "express";
import * as companyController from "../controllers/companyController";

const router = express.Router();

router.put("/restore", companyController.restoreCompaniesController); // restore logically deleted companies
router.put("/:company_no", companyController.updateCompanyController); // Update a company
router.get("/names", companyController.getCompanyNamesController); // Get all company names
router.get("/:company_no", companyController.getCompanyController); // Get a single company by ID
router.post("/", companyController.createCompanyController); // Create a new company
router.delete("/", companyController.deleteCompaniesController); // logically Delete companies
router.get("/", companyController.getCompaniesController); // Get all companies

export default router;
