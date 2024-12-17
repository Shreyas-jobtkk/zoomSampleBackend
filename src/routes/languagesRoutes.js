// routes/languagesRoutes.js
import express from "express";
import * as languagesController from "../controllers/languagesController.js";

const router = express.Router();

router.get("/", languagesController.getLanguages); // Get all languages
router.get("/:id", languagesController.getLanguage); // Get a single language by ID
router.post("/", languagesController.createLanguage); // Create a new language
router.put("/:id", languagesController.updateLanguage); // Update a language
router.delete("/", languagesController.deleteLanguages); // Delete languages

export default router;
