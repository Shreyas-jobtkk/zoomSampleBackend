import pool from "../db"; // Assuming you have a pool.ts for db connection
import { Language, LanguageWithId } from "../types/languageSupportTypes";

// Create a new language
export const createLanguage = async (
  languageData: Language
): Promise<LanguageWithId> => {
  // // console.log(333, languageData);
  const { language_name, language_name_furigana, language_note } = languageData;
  try {
    const result = await pool.query(
      `INSERT INTO languages_support_info (language_name, language_name_furigana, language_note, created_at, updated_at, language_deleted)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false) RETURNING *`,
      [language_name, language_name_furigana, language_note]
    );
    // // console.log(333, languageData, result.rows[0]);
    return result.rows[0]; // TypeScript automatically infers the type based on the result
  } catch (err) {
    throw new Error("Failed to insert language.");
  }
};

// Get all languages with pagination and filtering options
export const getAllLanguages = async (
  page: number,
  limit: number,
  language_no_min: number | string,
  language_no_max: number | string,
  language_name: string,
  language_name_furigana: string
) => {
  try {
    const values: any[] = [];
    const conditions: string[] = [];

    if (language_no_min !== "" && language_no_max !== "") {
      values.push(language_no_min, language_no_max);
      conditions.push(
        `languages_support_no BETWEEN $${values.length - 1} AND $${values.length}`
      );
    } else if (language_no_min !== "") {
      values.push(language_no_min);
      conditions.push(`languages_support_no >= $${values.length}`);
    } else if (language_no_max !== "") {
      values.push(language_no_max);
      conditions.push(`languages_support_no <= $${values.length}`);
    }

    if (language_name) {
      values.push(`%${language_name}%`);
      conditions.push(`language_name ILIKE $${values.length}`);
    }

    if (language_name_furigana) {
      values.push(`%${language_name_furigana}%`);
      conditions.push(`language_name_furigana ILIKE $${values.length}`);
    }

    let countQuery = "SELECT COUNT(*) FROM languages_support_info";
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    const countResult = await pool.query(countQuery, values);
    const totalRecords = parseInt(countResult.rows[0].count, 10);

    let dataQuery = "SELECT * FROM languages_support_info";
    let dataValues = [...values];

    if (conditions.length > 0) {
      dataQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    const offset = (page - 1) * limit;
    dataValues.push(limit, offset);
    dataQuery += ` ORDER BY languages_support_no ASC LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`;

    const result = await pool.query(dataQuery, dataValues);
    return { totalRecords, languages: result.rows };
  } catch (err: any) {
    console.error("Error fetching languages:", err.message);
    throw new Error("Failed to fetch languages.");
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

// restore deleted companies based on an array of company IDs
export const restoreLanguages = async (language_nos: number[]) => {
  try {
    const result = await pool.query(
      `UPDATE languages_support_info
      SET language_deleted = false, updated_at = CURRENT_TIMESTAMP 
      WHERE languages_support_no = ANY($1::int[]) 
      RETURNING *`,
      [language_nos]
    );
    return result.rows;
  } catch (err) {
    throw new Error("Failed to restore languages.");
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
      "SELECT language_name_furigana, language_name, languages_support_no FROM languages_support_info  ORDER BY languages_support_no ASC"
    );
    return result.rows; // TypeScript will infer the correct type
  } catch (err) {
    throw new Error("Failed to fetch language names.");
  }
};
