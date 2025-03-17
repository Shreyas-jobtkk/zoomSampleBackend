import pool from "../db.js";
import { CompanyData } from "../types/companyTypes";

// create a new company
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

// get a company by its ID
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

// update a company by its ID
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

// delete companies based on an array of company IDs
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

// restore deleted companies based on an array of company IDs
export const restoreCompanies = async (company_nos: number[]) => {
  try {
    const result = await pool.query(
      `UPDATE company_info 
       SET company_deleted = false 
       WHERE company_no = ANY($1::int[]) 
       RETURNING *`,
      [company_nos]
    );
    return result.rows;
  } catch (err: any) {
    console.error("Error restoring companies:", err.message);
    throw new Error("Failed to restore companies.");
  }
};

//fetch all companies with optional query parameters for filtering and pagination
export const getAllCompanies = async (
  page: number,
  limit: number,
  company_no_min: number | string,
  company_no_max: number | string,
  company_name: string,
  company_name_furigana: string
) => {
  try {
    const values: any[] = [];
    const conditions: string[] = [];

    // Apply filters dynamically
    if (company_no_min !== "" && company_no_max !== "") {
      values.push(company_no_min, company_no_max);
      conditions.push(
        `company_no BETWEEN $${values.length - 1} AND $${values.length}`
      );
    } else if (company_no_min !== "") {
      values.push(company_no_min);
      conditions.push(`company_no >= $${values.length}`);
    } else if (company_no_max !== "") {
      values.push(company_no_max);
      conditions.push(`company_no <= $${values.length}`);
    }

    if (company_name) {
      values.push(`%${company_name}%`);
      conditions.push(`company_name ILIKE $${values.length}`);
    }

    if (company_name_furigana) {
      values.push(`%${company_name_furigana}%`);
      conditions.push(`company_name_furigana ILIKE $${values.length}`);
    }

    // Prepare the count query
    let countQuery = "SELECT COUNT(*) FROM company_info";
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Execute the count query to get the total number of records
    const countResult = await pool.query(countQuery, values);
    const totalRecords = parseInt(countResult.rows[0].count, 10);

    // Now prepare the query to fetch the paginated data
    let dataQuery = "SELECT * FROM company_info";
    let dataValues = [...values]; // Copy the values array to avoid mutation

    if (conditions.length > 0) {
      dataQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Pagination
    const offset = (page - 1) * limit;
    dataValues.push(limit, offset);
    dataQuery += ` ORDER BY company_no ASC LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`;

    // Execute the data query to get the actual records
    const result = await pool.query(dataQuery, dataValues);
    return { totalRecords, companies: result.rows };
  } catch (err: any) {
    console.error("Error fetching companies:", err.message);
    throw new Error("Failed to fetch companies.");
  }
};

// fetch company numbers and names for selection options
export const getCompanyNumbersAndNames = async () => {
  try {
    const result = await pool.query(
      "SELECT company_no, company_name FROM company_info WHERE company_deleted = false"
    );
    return result.rows;
  } catch (err: any) {
    console.error("Error fetching company numbers and names:", err.message);
    throw new Error("Failed to fetch company numbers and names.");
  }
};
