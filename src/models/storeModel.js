import pool from "../db.js"; // Import the database connection pool

// Insert a new store
function createStore(storeData) {
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

  return pool.query(query, values).then((result) => result.rows[0]);
}

// Get all stores (excluding soft-deleted ones)
function getAllStores() {
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
  return pool.query(query).then((result) => result.rows);
}

export default { createStore, getAllStores };
