// routes/languagesRoutes.js
import express from "express";
import * as languagesController from "../controllers/languagesController.js";

const router = express.Router();

router.get("/names", languagesController.getLanguageNames); // Fetch only language names and IDs
router.get("/", languagesController.getAllLanguages); // Get all languages
router.get("/:id", languagesController.getLanguage); // Get a single language by ID
router.post("/batch", languagesController.getLanguagesById);
router.post("/", languagesController.createLanguage); // Create a new language
router.put("/:id", languagesController.updateLanguage); // Update a language
router.delete("/", languagesController.deleteLanguages); // Delete languages

export default router;
