// controllers/languagesController.ts
import * as languagesModel from "../models/languagesModel";
import { Request, Response } from "express";

// Create a new language
export const createLanguageController = async (
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

// Get all languages with pagination and filtering options
export const getAllLanguagesController = async (
  req: Request,
  res: Response
) => {
  // console.log("Fetching languages with query:", req.query);

  const {
    page,
    limit,
    language_no_min,
    language_no_max,
    language_name,
    language_name_furigana,
  } = req.query;

  const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
  const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
  const minLanguageNo = language_no_min ? Number(language_no_min) : "";
  const maxLanguageNo = language_no_max ? Number(language_no_max) : "";
  const languageName = typeof language_name === "string" ? language_name : "";
  const languageNameFurigana =
    typeof language_name_furigana === "string" ? language_name_furigana : "";

  try {
    const languages = await languagesModel.getAllLanguages(
      pageNumber,
      limitNumber,
      minLanguageNo,
      maxLanguageNo,
      languageName,
      languageNameFurigana
    );

    res.status(200).json(languages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a language by ID
export const getLanguageByIdController = async (
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
export const updateLanguageController = async (
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
export const deleteLanguagesController = async (
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

// restore deleted companies based on an array of company IDs
export const restoreLanguagesController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { language_nos } = req.body as { language_nos: number[] }; // Expecting an array of language IDs

  try {
    const restoredLanguages =
      await languagesModel.restoreLanguages(language_nos);
    if (restoredLanguages.length === 0) {
      return res.status(404).json({ message: "No languages found to restore" });
    }
    return res.status(200).json({
      message: "Languages restored successfully",
      restored: restoredLanguages,
    });
  } catch (err: any) {
    console.error("Error restoring languages:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Get only language_name and languages_support_no
export const getLanguagesAllNamesController = async (
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
