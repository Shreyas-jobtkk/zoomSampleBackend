// controllers/languagesController.js
import * as languagesModel from "../models/languagesModel.js";

// Get all languages
export const getAllLanguages = async (req, res) => {
  try {
    const languages = await languagesModel.getAllLanguages();
    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get multiple languages by IDs
export const getLanguagesById = async (req, res) => {
  const { ids } = req.body; // Expecting an array of IDs in the request body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid or missing IDs array" });
  }

  try {
    const languages = await languagesModel.getLanguagesById(ids);
    if (languages.length === 0) {
      return res.status(404).json({ message: "No languages found" });
    }
    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a language by ID
export const getLanguage = async (req, res) => {
  const { id } = req.params;
  try {
    const language = await languagesModel.getLanguageById(id);
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    res.status(200).json(language);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new language
export const createLanguage = async (req, res) => {
  const { language_name, language_name_furigana, language_note } = req.body;
  try {
    const language = await languagesModel.createLanguage({
      language_name,
      language_name_furigana,
      language_note,
    });
    res.status(201).json(language);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a language
export const updateLanguage = async (req, res) => {
  const { id } = req.params;
  const { language_name, language_name_furigana, language_note } = req.body;
  try {
    const language = await languagesModel.updateLanguage(id, {
      language_name,
      language_name_furigana,
      language_note,
    });
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    res.status(200).json(language);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete languages
export const deleteLanguages = async (req, res) => {
  const { ids } = req.body;
  try {
    const deletedLanguages = await languagesModel.deleteLanguages(ids);
    if (deletedLanguages.length === 0) {
      return res.status(404).json({ message: "No languages found to delete" });
    }
    res.status(200).json({
      message: "Languages deleted successfully",
      deleted: deletedLanguages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get only language_name and languages_support_no
export const getLanguageNames = async (req, res) => {
  try {
    const languages = await languagesModel.getLanguageNames();
    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
