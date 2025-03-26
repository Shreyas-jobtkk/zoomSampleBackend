import pool from "../db.js";
import { UpdateUserData, User, UserData } from "../types/userTypes";

// create a new User
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
    user_note,
  } = userData;

  try {
    const translatedLanguages = Array.isArray(translate_languages)
      ? translate_languages
      : [];

    const result = await pool.query(
      `INSERT INTO user_info (
          store_no, user_name_last, user_name_last_furigana,
          user_name_first, user_name_first_furigana, user_type, mail_address, 
          tel, tel_extension, translate_languages, password_expire, user_password, 
          user_note, created_at, updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
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
        user_note,
      ]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Error inserting user:", err);
    throw new Error("Failed to insert user.");
  }
};

// get a User by its ID
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

// update a User by its ID
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
        user_password = $9, 
        user_note = $10, store_no = $11, updated_at = CURRENT_TIMESTAMP
      WHERE user_no = $12 RETURNING *`,
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

// update Interpreters Status
export const updateInterpretersStatus = async (
  interpreter_no: string,
  interpreter_status: string
): Promise<User | null> => {
  try {
    const result = await pool.query(
      `UPDATE user_info SET 
        user_status = $1 
      WHERE user_no = $2 
      RETURNING *`,
      [interpreter_status, interpreter_no]
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

// delete User based on an array of company IDs
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

// restore deleted User based on an array of company IDs
export const restoreUsers = async (user_nos: number[]) => {
  const query = `
      UPDATE user_info
      SET 
        user_deleted = false, 
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        user_no = ANY($1::int[]) 
      RETURNING *
    `;

  const values = [user_nos];

  try {
    const result = await pool.query(query, values);
    return result.rows; // Return all the restored users
  } catch (err) {
    throw new Error("Failed to restore users.");
  }
};

// get All active Interpreters languages Id
export const getActiveAllInterpretersLanguagesId = async (): Promise<
  User[]
> => {
  const query = `
    SELECT 
      user_info.user_no,
      user_info.translate_languages
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
      user_info.user_type = 'interpreter' AND user_info.user_status = 'active'
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

// get All Interpreters with optional query parameters for filtering and pagination
export const getAllInterpreters = async (
  page: number,
  limit: number,
  company_no: number | string,
  store_no: number | string,
  interpreter_no_min: number | string,
  interpreter_no_max: number | string,
  interpreter_name_first: string,
  interpreter_name_furigana_first: string,
  interpreter_name_last: string,
  interpreter_name_furigana_last: string,
  interpreter_languages: string[] = []
): Promise<{ totalRecords: number; interpreters: User[] }> => {
  // console.log(777, interpreter_languages);
  const values: any[] = [];
  const conditions: string[] = ["user_info.user_type = 'interpreter'"];

  if (company_no) {
    values.push(company_no);
    conditions.push(`store_info.company_no = $${values.length}`);
  }

  if (store_no) {
    values.push(store_no);

    // console.log(377, values);
    conditions.push(`user_info.store_no = $${values.length}`);
  }
  if (interpreter_no_min) {
    values.push(interpreter_no_min);
    // console.log(177, values);
    conditions.push(`user_info.user_no >= $${values.length}`);
  }
  if (interpreter_no_max) {
    values.push(interpreter_no_max);
    conditions.push(`user_info.user_no <= $${values.length}`);
  }
  if (interpreter_name_first) {
    values.push(`%${interpreter_name_first}%`);
    conditions.push(`user_info.user_name_first ILIKE $${values.length}`);
  }
  if (interpreter_name_furigana_first) {
    values.push(`%${interpreter_name_furigana_first}%`);
    conditions.push(
      `user_info.user_name_first_furigana ILIKE $${values.length}`
    );
  }
  if (interpreter_name_last) {
    values.push(`%${interpreter_name_last}%`);
    conditions.push(`user_info.user_name_last ILIKE $${values.length}`);
  }
  if (interpreter_name_furigana_last) {
    values.push(`%${interpreter_name_furigana_last}%`);
    conditions.push(
      `user_info.user_name_last_furigana ILIKE $${values.length}`
    );
  }
  if (interpreter_name_furigana_last) {
    values.push(`%${interpreter_name_furigana_last}%`);
    conditions.push(
      `user_info.user_name_last_furigana ILIKE $${values.length}`
    );
  }

  // **Filter by interpreter_languages**: Ensure all selected languages are included in translate_languages
  if (interpreter_languages.length > 0) {
    values.push(interpreter_languages.map(Number)); // Ensures all values are integers
    conditions.push(`translate_languages @> $${values.length}::int[]`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

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
    ${whereClause}
    ORDER BY 
      user_info.store_no
    LIMIT $${values.length + 1} OFFSET $${values.length + 2};
  `;

  const countQuery = `
    SELECT COUNT(*) 
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
    ${whereClause};
  `;

  values.push(limit, (page - 1) * limit);

  try {
    // Get interpreters data
    const result = await pool.query(query, values);
    const totalRecordsResult = await pool.query(
      countQuery,
      values.slice(0, -2)
    );

    // // console.log(277, result.rows);

    const totalRecords = parseInt(totalRecordsResult.rows[0].count, 10);
    return { totalRecords, interpreters: result.rows };
  } catch (err) {
    throw new Error("Failed to fetch interpreters.");
  }
};

// get All Contractors with optional query parameters for filtering and pagination
export const getAllContractors = async (
  page: number,
  limit: number,
  company_no: number | string,
  store_no: number | string,
  contractor_no_min: number | string,
  contractor_no_max: number | string,
  contractor_name_first: string,
  contractor_name_furigana_first: string,
  contractor_name_last: string,
  contractor_name_furigana_last: string
): Promise<{ totalRecords: number; contractors: User[] }> => {
  const values: any[] = [];
  const conditions: string[] = ["user_info.user_type = 'contractor'"];

  if (company_no) {
    values.push(company_no);
    conditions.push(`store_info.company_no = $${values.length}`);
  }
  if (store_no) {
    values.push(store_no);
    conditions.push(`user_info.store_no = $${values.length}`);
  }
  if (contractor_no_min) {
    values.push(contractor_no_min);
    conditions.push(`user_info.user_no >= $${values.length}`);
  }
  if (contractor_no_max) {
    values.push(contractor_no_max);
    conditions.push(`user_info.user_no <= $${values.length}`);
  }
  if (contractor_name_first) {
    values.push(`%${contractor_name_first}%`);
    conditions.push(`user_info.user_name_first ILIKE $${values.length}`);
  }
  if (contractor_name_furigana_first) {
    values.push(`%${contractor_name_furigana_first}%`);
    conditions.push(
      `user_info.user_name_first_furigana ILIKE $${values.length}`
    );
  }
  if (contractor_name_last) {
    values.push(`%${contractor_name_last}%`);
    conditions.push(`user_info.user_name_last ILIKE $${values.length}`);
  }
  if (contractor_name_furigana_last) {
    values.push(`%${contractor_name_furigana_last}%`);
    conditions.push(
      `user_info.user_name_last_furigana ILIKE $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

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
    ${whereClause}
    ORDER BY 
      user_info.store_no
    LIMIT $${values.length + 1} OFFSET $${values.length + 2};
  `;

  const countQuery = `
    SELECT COUNT(*) 
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
    ${whereClause};
  `;

  values.push(limit, (page - 1) * limit);

  try {
    // Get contractors data
    const result = await pool.query(query, values);
    const totalRecordsResult = await pool.query(
      countQuery,
      values.slice(0, -2)
    );

    const totalRecords = parseInt(totalRecordsResult.rows[0].count, 10);
    return { totalRecords, contractors: result.rows };
  } catch (err) {
    throw new Error("Failed to fetch contractors.");
  }
};

// get All Administrators with optional query parameters for filtering and pagination
export const getAllAdministrators = async (
  page: number,
  limit: number,
  company_no: number | string,
  store_no: number | string,
  admin_no_min: number | string,
  admin_no_max: number | string,
  admin_name_first: string,
  admin_name_furigana_first: string,
  admin_name_last: string,
  admin_name_furigana_last: string
): Promise<{ totalRecords: number; administrators: User[] }> => {
  const values: any[] = [];
  const conditions: string[] = ["user_info.user_type = 'administrator'"];

  if (company_no) {
    values.push(company_no);
    conditions.push(`store_info.company_no = $${values.length}`);
  }
  if (store_no) {
    values.push(store_no);
    conditions.push(`user_info.store_no = $${values.length}`);
  }
  if (admin_no_min) {
    values.push(admin_no_min);
    conditions.push(`user_info.user_no >= $${values.length}`);
  }
  if (admin_no_max) {
    values.push(admin_no_max);
    conditions.push(`user_info.user_no <= $${values.length}`);
  }
  if (admin_name_first) {
    values.push(`%${admin_name_first}%`);
    conditions.push(`user_info.user_name_first ILIKE $${values.length}`);
  }
  if (admin_name_furigana_first) {
    values.push(`%${admin_name_furigana_first}%`);
    conditions.push(
      `user_info.user_name_first_furigana ILIKE $${values.length}`
    );
  }
  if (admin_name_last) {
    values.push(`%${admin_name_last}%`);
    conditions.push(`user_info.user_name_last ILIKE $${values.length}`);
  }
  if (admin_name_furigana_last) {
    values.push(`%${admin_name_furigana_last}%`);
    conditions.push(
      `user_info.user_name_last_furigana ILIKE $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

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
    ${whereClause}
    ORDER BY 
      user_info.store_no
    LIMIT $${values.length + 1} OFFSET $${values.length + 2};
  `;

  const countQuery = `
    SELECT COUNT(*) 
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
    ${whereClause};
  `;

  values.push(limit, (page - 1) * limit);

  try {
    // Get administrators data
    const result = await pool.query(query, values);
    const totalRecordsResult = await pool.query(
      countQuery,
      values.slice(0, -2)
    );

    const totalRecords = parseInt(totalRecordsResult.rows[0].count, 10);
    return { totalRecords, administrators: result.rows };
  } catch (err) {
    throw new Error("Failed to fetch administrators.");
  }
};

// validate Contractors Authentication
export const getContractorsAuth = async (
  mail_address: string
): Promise<
  { mail_address: string; user_password: string; user_no: number }[]
> => {
  try {
    const result = await pool.query(
      `SELECT mail_address, user_password,user_no FROM user_info WHERE user_type = 'contractor' AND mail_address = $1`,
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

// validate Interpreters Authentication
export const getInterpretersAuth = async (
  mail_address: string
): Promise<
  { mail_address: string; user_password: string; user_no: number }[]
> => {
  try {
    const result = await pool.query(
      `SELECT mail_address, user_password,user_no FROM user_info WHERE user_type = 'interpreter' AND mail_address = $1`,
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

// validate Administrators Authentication
export const getAdministratorsAuth = async (
  mail_address: string
): Promise<
  { mail_address: string; user_password: string; user_no: number }[]
> => {
  try {
    const result = await pool.query(
      `SELECT mail_address, user_password,user_no FROM user_info WHERE user_type = 'administrator' AND mail_address = $1`,
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
