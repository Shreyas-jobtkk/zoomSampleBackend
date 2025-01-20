// controllers/languagesController.ts
import * as languagesModel from "../models/languagesModel";
import { Request, Response } from "express";

// Create a new language
export const createLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { language_name, language_name_furigana, language_note } = req.body;
  try {
    const language = await languagesModel.createLanguage({
      language_name,
      language_name_furigana,
      language_note,
    });
    return res.status(201).json(language);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Get all languages
export const getAllLanguages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const languages = await languagesModel.getAllLanguages();
    return res.status(200).json(languages);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Get multiple languages by IDs
export const getLanguagesById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ids } = req.body; // Expecting an array of IDs in the request body
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid or missing IDs array" });
  }

  try {
    const languages = await languagesModel.getLanguagesById(ids);
    if (languages.length === 0) {
      return res.status(404).json({ message: "No languages found" });
    }
    return res.status(200).json(languages);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Get a language by ID
export const getLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const language_no = Number(req.params.language_no);
  try {
    const language = await languagesModel.getLanguageById(language_no);
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    return res.status(200).json(language);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Update a language
export const updateLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const language_no = Number(req.params.language_no);
  const { language_name, language_name_furigana, language_note } = req.body;
  try {
    const language = await languagesModel.updateLanguage(language_no, {
      language_name,
      language_name_furigana,
      language_note,
    });
    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }
    return res.status(200).json(language);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Delete languages
export const deleteLanguages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { language_nos } = req.body as { language_nos: number[] };
  try {
    const deletedLanguages = await languagesModel.deleteLanguages(language_nos);
    if (deletedLanguages.length === 0) {
      return res.status(404).json({ message: "No languages found to delete" });
    }
    return res.status(200).json({
      message: "Languages deleted successfully",
      deleted: deletedLanguages,
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Get only language_name and languages_support_no
export const getLanguageNames = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const languages = await languagesModel.getLanguageNames();
    return res.status(200).json(languages);
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
