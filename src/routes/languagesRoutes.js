// routes/languagesRoutes.js
import express from "express";
import * as languagesController from "../controllers/languagesController";

const router = express.Router();
router.put("/restore", languagesController.restoreLanguagesController); // Handle restoring languages
router.get("/names", languagesController.getLanguageNames); // Fetch only language names and IDs
router.get("/", languagesController.getAllLanguages); // Get all languages
router.get("/:language_no", languagesController.getLanguage); // Get a single language by ID
router.post("/language_by_id", languagesController.getLanguagesById);
router.post("/", languagesController.createLanguage); // Create a new language
router.put("/:language_no", languagesController.updateLanguage); // Update a language
router.delete("/", languagesController.deleteLanguages); // Delete languages

export default router;
