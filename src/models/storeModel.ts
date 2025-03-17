import pool from "../db"; // Import the database connection pool
import { StoreData, StoreDetails } from "../types/storeTypes";

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

// Handle restoring deleting stores
export const restoreStores = async (store_nos: number[]) => {
  const query = `
      UPDATE store_info
      SET 
        store_delete = false, 
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        store_no = ANY($1::int[]) 
      RETURNING *
    `;

  const values = [store_nos];

  try {
    const result = await pool.query(query, values);
    return result.rows; // Return all the restored stores
  } catch (err) {
    throw new Error("Failed to restore stores.");
  }
};

// Get all stores (excluding soft-deleted ones)
export const getAllStores = async (
  page: number,
  limit: number,
  company_no: number | string,
  store_no_min: number | string,
  store_no_max: number | string,
  store_name: string,
  store_name_furigana: string
) => {
  try {
    const values: any[] = [];
    const conditions: string[] = [];

    // Apply company_no filter
    if (company_no !== "") {
      values.push(company_no);
      conditions.push(`store_info.company_no = $${values.length}`);
    }

    // Apply store_no filters
    if (store_no_min !== "" && store_no_max !== "") {
      values.push(store_no_min, store_no_max);
      conditions.push(
        `store_info.store_no BETWEEN $${values.length - 1} AND $${values.length}`
      );
    } else if (store_no_min !== "") {
      values.push(store_no_min);
      conditions.push(`store_info.store_no >= $${values.length}`);
    } else if (store_no_max !== "") {
      values.push(store_no_max);
      conditions.push(`store_info.store_no <= $${values.length}`);
    }

    // Apply store_name filter
    if (store_name) {
      values.push(`%${store_name}%`);
      conditions.push(`store_info.store_name ILIKE $${values.length}`);
    }

    // Apply store_name_furigana filter
    if (store_name_furigana) {
      values.push(`%${store_name_furigana}%`);
      conditions.push(`store_info.store_name_furigana ILIKE $${values.length}`);
    }

    // Prepare the count query
    let countQuery = `
      SELECT COUNT(*) FROM store_info 
      JOIN company_info ON store_info.company_no = company_info.company_no 
      WHERE company_info.company_deleted = false
    `;

    if (conditions.length > 0) {
      countQuery += ` AND ${conditions.join(" AND ")}`;
    }

    // Execute the count query
    const countResult = await pool.query(countQuery, values);
    const totalRecords = parseInt(countResult.rows[0].count, 10);

    // Prepare the data query
    let dataQuery = `
      SELECT store_info.*, company_info.company_name 
      FROM store_info 
      JOIN company_info ON store_info.company_no = company_info.company_no 
      WHERE company_info.company_deleted = false
    `;

    let dataValues = [...values];

    if (conditions.length > 0) {
      dataQuery += ` AND ${conditions.join(" AND ")}`;
    }

    // Pagination
    const offset = (page - 1) * limit;
    dataValues.push(limit, offset);
    dataQuery += ` ORDER BY store_info.store_no ASC LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`;

    // Execute the data query
    const result = await pool.query(dataQuery, dataValues);
    return { totalRecords, stores: result.rows };
  } catch (err: any) {
    console.error("Error fetching stores:", err.message);
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
