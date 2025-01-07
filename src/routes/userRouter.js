import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

console.log(156, "user");

// router.get("/names", userController.getUserNames); // Get user names
router.get("/:id", userController.getUserById); // Get a single user by ID
router.post("/", userController.createUser); // Create a new user
router.put("/:id", userController.updateUser); // Update a user
router.delete("/", userController.deleteUsers); // Delete users
router.get("/", userController.getUsers); // Get all users

export default router;
