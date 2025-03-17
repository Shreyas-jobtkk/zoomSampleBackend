import express from "express";
import * as companyController from "../controllers/companyController";

const router = express.Router();

// Route to restore logically deleted companies
router.put("/restore", companyController.restoreCompaniesController);

// Route to update an existing company by its company number
router.put("/:company_no", companyController.updateCompanyController);

// Route to get all company names (e.g., for a dropdown or listing)
router.get("/names", companyController.getCompanyNamesController);

// Route to get a single company by its company number
router.get("/:company_no", companyController.getCompanyController);

// Route to create a new company
router.post("/", companyController.createCompanyController);

// Route to logically delete multiple companies
router.delete("/", companyController.deleteCompaniesController);

// Route to get a list of all companies
router.get("/", companyController.getAllCompaniesController);

export default router;
