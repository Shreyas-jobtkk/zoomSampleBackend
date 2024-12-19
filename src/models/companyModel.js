import pool from "../db.js";

export const createCompany = async (companyData) => {
  console.log(111);
  const { company_name, company_name_furigana, note } = companyData;
  try {
    const result = await pool.query(
      `INSERT INTO company_info (company_name, company_name_furigana, company_note, created_at, updated_at, company_deleted)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false) RETURNING *`,
      [company_name, company_name_furigana, note]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error("Failed to insert company.");
  }
};

export const getCompanyById = async (id) => {
  try {
    const result = await pool.query(
      "SELECT * FROM company_info WHERE company_no = $1",
      [id]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error("Failed to fetch company.");
  }
};

export const updateCompany = async (id, companyData) => {
  const { company_name, company_name_furigana, company_note } = companyData;
  try {
    const result = await pool.query(
      "UPDATE company_info SET company_name = $1, company_name_furigana = $2, company_note = $3, updated_at = CURRENT_TIMESTAMP WHERE company_no = $4 RETURNING *",
      [company_name, company_name_furigana, company_note, id]
    );
    console.log(2555555, result.rows[0]);
    return result.rows[0];
  } catch (err) {
    throw new Error("Failed to update company.");
  }
};

export const deleteCompanies = async (ids) => {
  try {
    const result = await pool.query(
      "UPDATE company_info SET company_deleted = true WHERE company_no = ANY($1::int[]) RETURNING *",
      [ids]
    );
    return result.rows;
  } catch (err) {
    throw new Error("Failed to delete companies.");
  }
};

export const getAllCompanies = async () => {
  try {
    const result = await pool.query("SELECT * FROM company_info");
    return result.rows;
  } catch (err) {
    throw new Error("Failed to fetch companies.");
  }
};

export const getCompanyNumbersAndNames = async () => {
  try {
    const result = await pool.query(
      "SELECT company_no, company_name FROM company_info"
    );
    return result.rows; // Make sure this returns data as expected
  } catch (err) {
    console.error("Error fetching company numbers and names:", err);
    throw new Error("Failed to fetch company numbers and names.");
  }
};
