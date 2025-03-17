import express from "express";
import * as languagesController from "../controllers/languagesController";

const router = express.Router();

// Route to restore languages (typically for soft delete functionality)
router.put("/restore", languagesController.restoreLanguagesController);

// Route to fetch only language names and their IDs (e.g., for dropdowns or selections)
router.get("/names", languagesController.getLanguageNamesController);

// Route to get all languages with full details
router.get("/", languagesController.getAllLanguagesController);

// Route to get a single language by its ID
router.get("/:language_no", languagesController.getLanguageController);

// Route to fetch languages by their IDs (may return multiple languages based on IDs)
router.post("/language_by_id", languagesController.getLanguagesByIdController);

// Route to create a new language entry
router.post("/", languagesController.createLanguageController);

// Route to update an existing language by its ID
router.put("/:language_no", languagesController.updateLanguageController);

// Route to delete languages (likely soft delete based on naming)
router.delete("/", languagesController.deleteLanguagesController);

export default router;
