import pool from "../db.js";

export const createUser = async (userData) => {
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
    console.log(21445, userData);
    // Ensure translate_languages is an array of integers
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
        store_no,
        user_name_last,
        user_name_last_furigana,
        user_name_first,
        user_name_first_furigana,
        user_type,
        mail_address,
        tel,
        tel_extension,
        translatedLanguages, // Array of integers for translate_languages
        password_expire,
        user_password,
        meeting_id,
        meeting_passcode,
        user_note,
      ]
    );

    return result.rows[0]; // Return the created user
  } catch (err) {
    console.error("Error inserting user:", err);
    throw new Error("Failed to insert user.");
  }
};

export const getUserById = async (id) => {
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
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (err) {
    throw new Error("Failed to fetch user by ID.");
  }
};

export const updateUser = async (id, userData) => {
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

    console.log(1445, id, userData);

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
        store_no,
        id,
      ]
    );

    console.log(21445, result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error("Database error:", err.message, err.stack);
    throw new Error("Failed to update user.");
  }
};

export const updateInterpretersStatus = async (mail_id, interpreter_status) => {
  console.log(2155, mail_id, interpreter_status);
  try {
    const result = await pool.query(
      `UPDATE user_info SET 
        user_status = $1 
      WHERE mail_address = $2 
      RETURNING *`,
      [interpreter_status, mail_id]
    );

    if (result.rows.length === 0) {
      return null; // No user found with the given ID
    }

    return result.rows[0];
  } catch (err) {
    console.error("Database error:", err.message, err.stack);
    throw new Error("Failed to update user.");
  }
};

export const deleteUsers = async (ids) => {
  try {
    const result = await pool.query(
      "UPDATE user_info SET user_deleted = true WHERE user_no = ANY($1::int[]) RETURNING *",
      [ids]
    );
    return result.rows;
  } catch (err) {
    throw new Error("Failed to delete users.");
  }
};

export const getAllInterpreters = async () => {
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

export const getAllContractors = async () => {
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

export const getContractorsAuth = async (mail_address) => {
  console.log("Checking credentials in the database...");

  try {
    // Query to get the user with the matching email address
    const result = await pool.query(
      `SELECT mail_address, user_password FROM user_info WHERE user_type = 'contractor' AND mail_address = $1`,
      [mail_address]
    );

    // If no user is found
    if (result.rows.length === 0) {
      console.log("invalid credentials:");
      return [];
    }

    console.log("valid credentials:");

    // Return the user data (assuming the result only returns one user)
    return result.rows;
  } catch (error) {
    console.error("Database error:", error.message);
    throw new Error("Failed to fetch contractor credentials.");
  }
};

export const getInterpretersAuth = async (mail_address) => {
  console.log("Checking credentials in the database...");

  try {
    // Query to get the user with the matching email address
    const result = await pool.query(
      `SELECT mail_address, user_password FROM user_info WHERE user_type = 'interpreter' AND mail_address = $1`,
      [mail_address]
    );

    // If no user is found
    if (result.rows.length === 0) {
      console.log("invalid credentials:");
      return [];
    }

    console.log("valid credentials:");

    // Return the user data (assuming the result only returns one user)
    return result.rows;
  } catch (error) {
    console.error("Database error:", error.message);
    throw new Error("Failed to fetch contractor credentials.");
  }
};

export const getAdministratorsAuth = async (mail_address) => {
  console.log("Checking credentials in the database...");

  try {
    // Query to get the user with the matching email address
    const result = await pool.query(
      `SELECT mail_address, user_password FROM user_info WHERE user_type = 'administrator' AND mail_address = $1`,
      [mail_address]
    );

    // If no user is found
    if (result.rows.length === 0) {
      console.log("invalid credentials:");
      return [];
    }

    console.log("valid credentials:");

    // Return the user data (assuming the result only returns one user)
    return result.rows;
  } catch (error) {
    console.error("Database error:", error.message);
    throw new Error("Failed to fetch contractor credentials.");
  }
};

export const getAllAdministrators = async () => {
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

export const getUserNumbersAndNames = async () => {
  try {
    const result = await pool.query(
      "SELECT user_no, user_name_last, user_name_first FROM user_info"
    );
    return result.rows;
  } catch (err) {
    throw new Error("Failed to fetch user numbers and names.");
  }
};
