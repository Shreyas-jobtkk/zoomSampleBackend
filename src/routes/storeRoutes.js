import express from "express"; // Import express
import * as storeController from "../controllers/storeController"; // Import all store controllers

const router = express.Router();

// Route to restore stores (e.g., for soft deletes)
router.put("/restore", storeController.restoreStoresController);

// POST /stores: Create a new store
router.post("/", storeController.createStoreController);

// GET /stores: Get a list of all stores
router.get("/", storeController.getAllStoresController);

// GET /stores/company/:companyNo: Get store details (store_no, store_name) by company ID
router.get(
  "/company/:companyNo",
  storeController.getStoreDetailsByCompanyController
);

// GET /stores/:storeNo: Get a single store by its store number
router.get("/:storeNo", storeController.getStoreByStoreNoController);

// PUT /stores/:storeNo: Update an existing store by its store number
router.put("/:storeNo", storeController.updateStoreController);

// DELETE /stores: Delete multiple stores (soft delete or permanent)
router.delete("/", storeController.deleteStoresController);

export default router; // Export the router
