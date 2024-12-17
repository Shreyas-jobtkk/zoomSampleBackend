import express from "express"; // Import express
import * as storeController from "../controllers/storeController.js"; // Import all store controllers

const router = express.Router();

// POST /stores: Create a new store
router.post("/", storeController.createStoreController);

// GET /stores: Get all stores
router.get("/", storeController.getAllStoresController);

// GET /stores/:storeNo: Get a single store by ID
router.get("/:storeNo", storeController.getStoreByIdController);

// PUT /stores/:storeNo: Update an existing store by ID
router.put("/:storeNo", storeController.updateStoreController);

// DELETE /stores: Delete multiple stores
router.delete("/", storeController.deleteStoresController);

export default router; // Export the router
