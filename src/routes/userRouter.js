import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

// router.get("/names", userController.getUserNames); // Get user names
router.get("/interpreter", userController.getAllInterpreters); // Get all interpreters
router.get("/contractor", userController.getAllContractors); // Get all interpreters
router.get("/administrator", userController.getAllAdministrators); // Get all interpreters
router.get("/:id", userController.getUserById); // Get a single user by ID
router.post("/", userController.createUser); // Create a new user
router.put("/:id", userController.updateUser); // Update a user
router.delete("/", userController.deleteUsers); // Delete users

export default router;
