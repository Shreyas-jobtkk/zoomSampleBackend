import express from "express";
import * as companyController from "../controllers/companyController.js";

const router = express.Router();

router.get("/", companyController.getCompanies); // Get all companies
router.get("/:id", companyController.getCompany); // Get a single company by ID
router.post("/", companyController.createCompany); // Create a new company
router.put("/:id", companyController.updateCompany); // Update a company
router.delete("/", companyController.deleteCompanies); // Delete companies

export default router;

// // routes/companyRoutes.js
// import express from "express"; // Import Express
// import { getAllCompaniesController } from "../controllers/companyController.js"; // Import controller

// const router = express.Router();

// // Define the GET route
// router.get("/company", getAllCompaniesController);

// export default router; // Export the router
