import pool from "../db.js";

// Type Definitions
interface CompanyData {
  company_name: string;
  company_name_furigana: string;
  company_note: string;
}

export const createCompany = async (companyData: CompanyData) => {
  const { company_name, company_name_furigana, company_note } = companyData;
  try {
    const result = await pool.query(
      `INSERT INTO company_info (company_name, company_name_furigana, company_note, created_at, updated_at, company_deleted)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false) RETURNING *`,
      [company_name, company_name_furigana, company_note]
    );
    return result.rows[0];
  } catch (err: any) {
    console.error("Error creating company:", err.message);
    throw new Error("Failed to insert company.");
  }
};

export const getCompanyById = async (company_no: number) => {
  try {
    const result = await pool.query(
      "SELECT * FROM company_info WHERE company_no = $1",
      [company_no]
    );
    return result.rows[0];
  } catch (err: any) {
    console.error("Error fetching company by ID:", err.message);
    throw new Error("Failed to fetch company.");
  }
};

export const updateCompany = async (
  company_no: number,
  companyData: CompanyData
) => {
  const { company_name, company_name_furigana, company_note } = companyData;
  try {
    const result = await pool.query(
      `UPDATE company_info 
       SET company_name = $1, 
           company_name_furigana = $2, 
           company_note = $3, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE company_no = $4 
       RETURNING *`,
      [company_name, company_name_furigana, company_note, company_no]
    );
    return result.rows[0];
  } catch (err: any) {
    console.error("Error updating company:", err.message);
    throw new Error("Failed to update company.");
  }
};

export const deleteCompanies = async (company_nos: number[]) => {
  try {
    const result = await pool.query(
      `UPDATE company_info 
       SET company_deleted = true 
       WHERE company_no = ANY($1::int[]) 
       RETURNING *`,
      [company_nos]
    );
    return result.rows;
  } catch (err: any) {
    console.error("Error deleting companies:", err.message);
    throw new Error("Failed to delete companies.");
  }
};

export const getAllCompanies = async () => {
  try {
    const result = await pool.query("SELECT * FROM company_info");
    return result.rows;
  } catch (err: any) {
    console.error("Error fetching all companies:", err.message);
    throw new Error("Failed to fetch companies.");
  }
};

export const getCompanyNumbersAndNames = async () => {
  try {
    const result = await pool.query(
      "SELECT company_no, company_name FROM company_info"
    );
    return result.rows;
  } catch (err: any) {
    console.error("Error fetching company numbers and names:", err.message);
    throw new Error("Failed to fetch company numbers and names.");
  }
};
