import pool from "../db"; // Import the database connection pool
import { StoreData, StoreDetails } from "../types/storeTypes";

// Type definition for store details

// Insert a new store
export const createStore = async (
  storeData: StoreData
): Promise<StoreDetails> => {
  const {
    company_no,
    store_name,
    store_name_furigana,
    zip,
    pref,
    city,
    street,
    building_name,
    tel,
    fax,
    store_note,
  } = storeData;

  const query = `
    INSERT INTO store_info (
      company_no, store_name, store_name_furigana, zip, pref, city, street, building_name, tel, fax, store_note, created_at, updated_at, store_delete
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false)
    RETURNING *
  `;

  const values = [
    company_no,
    store_name,
    store_name_furigana,
    zip,
    pref,
    city,
    street,
    building_name,
    tel,
    fax,
    store_note,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    throw new Error("Failed to insert store.");
  }
};

// Update an existing store
export const updateStore = async (
  storeNo: number,
  storeData: StoreData
): Promise<StoreDetails | null> => {
  const {
    company_no,
    store_name,
    store_name_furigana,
    zip,
    pref,
    city,
    street,
    building_name,
    tel,
    fax,
    store_note,
  } = storeData;

  try {
    const result = await pool.query(
      "UPDATE store_info SET company_no = $1, store_name = $2, store_name_furigana = $3, zip = $4, pref = $5, city = $6, street = $7, building_name = $8, tel = $9, fax = $10, store_note = $11, updated_at = CURRENT_TIMESTAMP WHERE store_no = $12 RETURNING *",
      [
        Number(company_no),
        store_name,
        store_name_furigana,
        zip,
        pref,
        city,
        street,
        building_name,
        tel,
        fax,
        store_note,
        storeNo,
      ]
    );
    return result.rows[0] || null;
  } catch (err) {
    throw new Error("Failed to update store.");
  }
};

// Soft delete a store
export const deleteStores = async (
  storeNos: number[]
): Promise<StoreDetails[]> => {
  const query = `
      UPDATE store_info
      SET 
        store_delete = true, 
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        store_no = ANY($1::int[]) 
      RETURNING *
    `;

  const values = [storeNos];

  try {
    const result = await pool.query(query, values);
    return result.rows; // Return all the deleted stores
  } catch (err) {
    throw new Error("Failed to delete stores.");
  }
};

// Get all stores (excluding soft-deleted ones)
export const getAllStores = async (): Promise<StoreDetails[]> => {
  const query = `
    SELECT 
      store_info.*, 
      company_info.company_name
    FROM 
      store_info
    JOIN 
      company_info
    ON 
      store_info.company_no = company_info.company_no
    ORDER BY 
      store_info.store_no
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to fetch stores.");
  }
};

// Get a single store by ID
export const getStoreByStoreNo = async (
  storeNo: number
): Promise<StoreDetails | null> => {
  try {
    const result = await pool.query(
      `SELECT store_info.*, company_info.company_name 
       FROM store_info
       JOIN company_info ON store_info.company_no = company_info.company_no
       WHERE store_info.store_no = $1`,
      [storeNo]
    );

    return result.rows[0] || null;
  } catch (err) {
    console.error("Database error:", err);
    throw new Error("Failed to fetch store.");
  }
};

// Get store_no and store_name by company_no
export const getStoreDetailsByCompany = async (
  companyNo: number
): Promise<{ store_no: number; store_name: string }[]> => {
  const query = `
    SELECT store_no, store_name
    FROM store_info
    WHERE company_no = $1 AND store_delete = false
  `;

  try {
    const result = await pool.query(query, [companyNo]);
    return result.rows;
  } catch (err) {
    throw new Error("Failed to fetch store details by company ID.");
  }
};
