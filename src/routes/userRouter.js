import express from "express";
import * as userController from "../controllers/userController";

const router = express.Router();

// Route to restore users (e.g., for soft deletes)
router.put("/restore", userController.restoreUsersController);

// Route to get all interpreters
router.get("/interpreter", userController.getAllInterpretersController);

// Route to get all contractors
router.get("/contractor", userController.getAllContractorsController);

// Route to authenticate contractors
router.post("/contractor/auth", userController.getContractorsAuthController);

// Route to authenticate interpreters
router.post("/interpreter/auth", userController.getInterpretersAuthController);

// Route to update the status of an interpreter by their ID
router.put(
  "/interpreter/:interpreterNo",
  userController.updateInterpretersStatusController
);

// Route to authenticate administrators
router.post(
  "/administrator/auth",
  userController.getAdministratorsAuthController
);

// Route to get all administrators
router.get("/administrator", userController.getAllAdministratorsController);

// Route to get a single user by their user number (ID)
router.get("/:userNo", userController.getUserByIdController);

// Route to create a new user
router.post("/", userController.createUserController);

// Route to update an existing user by their user number (ID)
router.put("/:userNo", userController.updateUserController);

// Route to delete multiple users
router.delete("/", userController.deleteUsersController);

export default router;
