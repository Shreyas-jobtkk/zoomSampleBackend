import express from "express";
import * as userController from "../controllers/userController";

const router = express.Router();

router.put("/restore", userController.restoreUsersController); // Handle restoring users
router.get("/interpreter", userController.getAllInterpretersController); // Get all interpreters
router.get("/contractor", userController.getAllContractorsController); // Get all interpreters
router.post("/contractor/auth", userController.getContractorsAuthController); // Get all interpreters
router.post("/interpreter/auth", userController.getInterpretersAuthController); // Get all interpreters

router.put(
  "/interpreter/:interpreterNo",
  userController.updateInterpretersStatusController
); // Get all interpreters
router.post(
  "/administrator/auth",
  userController.getAdministratorsAuthController
); // Get all interpreters
router.get("/administrator", userController.getAllAdministratorsController); // Get all interpreters
router.get("/:userNo", userController.getUserByIdController); // Get a single user by ID
router.post("/", userController.createUserController); // Create a new user
router.put("/:userNo", userController.updateUserController); // Update a user
router.delete("/", userController.deleteUsersController); // Delete users

export default router;
