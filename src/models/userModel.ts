import pool from "../db.js";
import { UpdateUserData, User, UserData } from "../types/userTypes";

export const createUser = async (userData: UserData): Promise<User> => {
  const {
    store_no,
    user_name_last,
    user_name_last_furigana,
    user_name_first,
    user_name_first_furigana,
    user_type,
    mail_address,
    tel,
    tel_extension,
    translate_languages,
    password_expire,
    user_password,
    meeting_id,
    meeting_passcode,
    user_note,
  } = userData;

  try {
    const translatedLanguages = Array.isArray(translate_languages)
      ? translate_languages
      : [];

    const result = await pool.query(
      `INSERT INTO user_info (
          store_no, user_name_last,user_name_last_furigana,
          user_name_first,user_name_first_furigana, user_type, mail_address, 
          tel, tel_extension, translate_languages, password_expire, user_password, 
          meeting_id, meeting_passcode, user_note, created_at, updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING *`,
      [
        Number(store_no),
        user_name_last,
        user_name_last_furigana,
        user_name_first,
        user_name_first_furigana,
        user_type,
        mail_address,
        tel,
        tel_extension,
        translatedLanguages,
        password_expire,
        user_password,
        meeting_id,
        meeting_passcode,
        user_note,
      ]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Error inserting user:", err);
    throw new Error("Failed to insert user.");
  }
};

export const getUserById = async (userNo: number): Promise<User | null> => {
  const query = `
    SELECT 
      user_info.*, 
      store_info.store_name,
      store_info.company_no,
      company_info.company_name
    FROM 
      user_info
    JOIN 
      store_info
    ON 
      user_info.store_no = store_info.store_no
    JOIN 
      company_info
    ON 
      store_info.company_no = company_info.company_no
    WHERE 
      user_info.user_no = $1;
  `;

  try {
    const result = await pool.query(query, [userNo]);
    return result.rows[0] || null;
  } catch (err) {
    throw new Error("Failed to fetch user by ID.");
  }
};

export const updateUser = async (
  id: number,
  userData: UpdateUserData
): Promise<User> => {
  const {
    user_name_last,
    user_name_last_furigana,
    user_name_first,
    user_name_first_furigana,
    mail_address,
    tel,
    tel_extension,
    translate_languages,
    user_password,
    meeting_id,
    meeting_passcode,
    user_note,
    store_no,
  } = userData;

  try {
    const translatedLanguages = Array.isArray(translate_languages)
      ? translate_languages
      : [];

    const result = await pool.query(
      `UPDATE user_info SET
        user_name_last = $1, user_name_last_furigana = $2, 
        user_name_first = $3, user_name_first_furigana = $4,
        mail_address = $5, tel = $6, tel_extension = $7, 
        translate_languages = $8, 
        user_password = $9, meeting_id = $10, meeting_passcode = $11, 
        user_note = $12, store_no = $13, updated_at = CURRENT_TIMESTAMP
      WHERE user_no = $14 RETURNING *`,
      [
        user_name_last,
        user_name_last_furigana,
        user_name_first,
        user_name_first_furigana,
        mail_address,
        tel,
        tel_extension,
        translatedLanguages,
        user_password,
        meeting_id,
        meeting_passcode,
        user_note,
        Number(store_no),
        id,
      ]
    );

    return result.rows[0];
  } catch (err: any) {
    console.error("Database error:", err.message, err.stack);
    throw new Error("Failed to update user.");
  }
};

export const updateInterpretersStatus = async (
  mail_id: string,
  interpreter_status: string
): Promise<User | null> => {
  try {
    const result = await pool.query(
      `UPDATE user_info SET 
        user_status = $1 
      WHERE mail_address = $2 
      RETURNING *`,
      [interpreter_status, mail_id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (err: any) {
    console.error("Database error:", err.message, err.stack);
    throw new Error("Failed to update user.");
  }
};

export const deleteUsers = async (user_nos: number[]) => {
  try {
    const result = await pool.query(
      "UPDATE user_info SET user_deleted = true WHERE user_no = ANY($1::int[]) RETURNING *",
      [user_nos]
    );
    return result.rows;
  } catch (err) {
    throw new Error("Failed to delete users.");
  }
};

export const getAllInterpreters = async (): Promise<User[]> => {
  const query = `
    SELECT 
      user_info.*, 
      store_info.store_name,
      store_info.company_no,
      company_info.company_name
    FROM 
      user_info
    JOIN 
      store_info
    ON 
      user_info.store_no = store_info.store_no AND store_info.store_delete = false
    JOIN 
      company_info
    ON 
      store_info.company_no = company_info.company_no AND company_info.company_deleted = false
    WHERE 
      user_info.user_type = 'interpreter'
    ORDER BY 
      user_info.store_no;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to fetch users.");
  }
};

export const getAllContractors = async (): Promise<User[]> => {
  const query = `
    SELECT 
      user_info.*, 
      store_info.store_name,
      store_info.company_no,
      company_info.company_name
    FROM 
      user_info
    JOIN 
      store_info
    ON 
      user_info.store_no = store_info.store_no AND store_info.store_delete = false
    JOIN 
      company_info
    ON 
      store_info.company_no = company_info.company_no AND company_info.company_deleted = false
    WHERE 
      user_info.user_type = 'contractor'
    ORDER BY 
      user_info.store_no;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to fetch users.");
  }
};

export const getAllAdministrators = async (): Promise<User[]> => {
  const query = `
    SELECT 
      user_info.*, 
      store_info.store_name,
      store_info.company_no,
      company_info.company_name
    FROM 
      user_info
    JOIN 
      store_info
    ON 
      user_info.store_no = store_info.store_no AND store_info.store_delete = false
    JOIN 
      company_info
    ON 
      store_info.company_no = company_info.company_no AND company_info.company_deleted = false
    WHERE 
      user_info.user_type = 'administrator'
    ORDER BY 
      user_info.store_no;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to fetch users.");
  }
};

export const getContractorsAuth = async (
  mail_address: string
): Promise<{ mail_address: string; user_password: string }[]> => {
  try {
    const result = await pool.query(
      `SELECT mail_address, user_password FROM user_info WHERE user_type = 'contractor' AND mail_address = $1`,
      [mail_address]
    );

    if (result.rows.length === 0) {
      return [];
    }

    return result.rows;
  } catch (error: any) {
    console.error("Database error:", error.message);
    throw new Error("Failed to fetch contractor credentials.");
  }
};

export const getInterpretersAuth = async (
  mail_address: string
): Promise<{ mail_address: string; user_password: string }[]> => {
  try {
    const result = await pool.query(
      `SELECT mail_address, user_password FROM user_info WHERE user_type = 'interpreter' AND mail_address = $1`,
      [mail_address]
    );

    if (result.rows.length === 0) {
      return [];
    }

    return result.rows;
  } catch (error: any) {
    console.error("Database error:", error.message);
    throw new Error("Failed to fetch contractor credentials.");
  }
};

export const getAdministratorsAuth = async (
  mail_address: string
): Promise<{ mail_address: string; user_password: string }[]> => {
  try {
    const result = await pool.query(
      `SELECT mail_address, user_password FROM user_info WHERE user_type = 'administrator' AND mail_address = $1`,
      [mail_address]
    );

    if (result.rows.length === 0) {
      return [];
    }

    return result.rows;
  } catch (error: any) {
    console.error("Database error:", error.message);
    throw new Error("Failed to fetch contractor credentials.");
  }
};
