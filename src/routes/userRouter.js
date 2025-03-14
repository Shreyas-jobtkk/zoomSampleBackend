import express from "express";
import * as userController from "../controllers/userController";

const router = express.Router();

router.put("/restore", userController.restoreUsersController); // Handle restoring users
// router.get("/names", userController.getUserNames); // Get user names
router.get("/interpreter", userController.getAllInterpreters); // Get all interpreters
router.get("/contractor", userController.getAllContractors); // Get all interpreters
router.post("/contractor/auth", userController.getContractorsAuth); // Get all interpreters
router.post("/interpreter/auth", userController.getInterpretersAuth); // Get all interpreters

router.put(
  "/interpreter/:interpreterNo",
  userController.updateInterpretersStatus
); // Get all interpreters
router.post("/administrator/auth", userController.getAdministratorsAuth); // Get all interpreters
router.get("/administrator", userController.getAllAdministrators); // Get all interpreters
router.get("/:userNo", userController.getUserById); // Get a single user by ID
router.post("/", userController.createUser); // Create a new user
router.put("/:userNo", userController.updateUser); // Update a user
router.delete("/", userController.deleteUsers); // Delete users

export default router;
