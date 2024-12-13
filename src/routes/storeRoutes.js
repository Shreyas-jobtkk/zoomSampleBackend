import express from "express"; // Import express
import {
  createStoreController,
  getAllStoresController,
} from "../controllers/storeController.js"; // Import the store controllers

const router = express.Router();

// POST /stores: Create a new store
router.post("/", createStoreController);

// GET /stores: Get all stores
router.get("/", getAllStoresController);

export default router; // Export the router
