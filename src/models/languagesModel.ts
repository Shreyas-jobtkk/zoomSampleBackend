import pool from "../db"; // Assuming you have a pool.ts for db connection
import { Language, LanguageWithId } from "../types/languageSupportTypes";

// Create a new language
export const createLanguage = async (
  languageData: Language
): Promise<LanguageWithId> => {
  // console.log(333, languageData);
  const { language_name, language_name_furigana, language_note } = languageData;
  try {
    const result = await pool.query(
      `INSERT INTO languages_support_info (language_name, language_name_furigana, language_note, created_at, updated_at, language_deleted)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false) RETURNING *`,
      [language_name, language_name_furigana, language_note]
    );
    // console.log(333, languageData, result.rows[0]);
    return result.rows[0]; // TypeScript automatically infers the type based on the result
  } catch (err) {
    throw new Error("Failed to insert language.");
  }
};

// Get all languages
export const getAllLanguages = async (): Promise<LanguageWithId[]> => {
  try {
    const result = await pool.query("SELECT * FROM languages_support_info");
    return result.rows; // TypeScript automatically infers the type of rows
  } catch (err) {
    throw new Error("Failed to fetch languages.");
  }
};

// Get multiple language names (furigana) by an array of IDs
export const getLanguagesById = async (
  ids: number[]
): Promise<
  { language_name_furigana: string; languages_support_no: number }[]
> => {
  try {
    const result = await pool.query(
      `SELECT language_name_furigana, languages_support_no
       FROM languages_support_info 
       WHERE languages_support_no = ANY($1::int[])`,
      [ids]
    );
    // Explicitly type the 'row' parameter in the map function
    return result.rows.map(
      (row: {
        language_name_furigana: string;
        languages_support_no: number;
      }) => ({
        language_name_furigana: row.language_name_furigana,
        languages_support_no: row.languages_support_no,
      })
    );
  } catch (err) {
    throw new Error("Failed to fetch language names.");
  }
};

// Get a language by ID
export const getLanguageById = async (
  language_no: number
): Promise<LanguageWithId | null> => {
  try {
    const result = await pool.query(
      "SELECT * FROM languages_support_info WHERE languages_support_no = $1 AND language_deleted = false",
      [language_no]
    );
    return result.rows[0] || null;
  } catch (err) {
    throw new Error("Failed to fetch language.");
  }
};

// Update language
export const updateLanguage = async (
  id: number,
  languageData: Language
): Promise<LanguageWithId | null> => {
  const { language_name, language_name_furigana, language_note } = languageData;
  try {
    const result = await pool.query(
      `UPDATE languages_support_info
      SET language_name = $1, language_name_furigana = $2, language_note = $3, updated_at = CURRENT_TIMESTAMP
      WHERE languages_support_no = $4  RETURNING *`,
      [language_name, language_name_furigana, language_note, id]
    );
    return result.rows[0] || null;
  } catch (err) {
    throw new Error("Failed to update language.");
  }
};

// Delete languages (soft delete)
export const deleteLanguages = async (
  ids: number[]
): Promise<LanguageWithId[]> => {
  try {
    const result = await pool.query(
      `UPDATE languages_support_info
      SET language_deleted = true WHERE languages_support_no = ANY($1::int[]) RETURNING *`,
      [ids]
    );
    return result.rows; // TypeScript will infer the correct type
  } catch (err) {
    throw new Error("Failed to delete languages.");
  }
};

// Fetch only language_name and languages_support_no
export const getLanguageNames = async (): Promise<
  {
    language_name_furigana: string;
    language_name: string;
    languages_support_no: number;
  }[]
> => {
  try {
    const result = await pool.query(
      "SELECT language_name_furigana, language_name, languages_support_no FROM languages_support_info"
    );
    return result.rows; // TypeScript will infer the correct type
  } catch (err) {
    throw new Error("Failed to fetch language names.");
  }
};
