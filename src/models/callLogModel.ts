import pool from "../db.js";
import { CallLogData } from "../types/callLogTypes";

//create a new call log entry
export const createCallLog = async (callLogData: CallLogData) => {
  const {
    interpreter_no,
    languages_support_no,
    contract_no,
    call_dial,
    call_canceled,
    call_start,
    call_end,
    call_status,
    feed_back,
  } = callLogData;

  try {
    const result = await pool.query(
      `INSERT INTO call_log_info 
          (interpreter_no, language_support_no, contract_no, call_dial, call_canceled, call_start, call_end, call_status, feed_back) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
      [
        interpreter_no,
        languages_support_no,
        contract_no,
        call_dial || null, // Ensure null is passed if undefined
        call_canceled || null,
        call_start || null,
        call_end || null,
        call_status,
        feed_back || null,
      ]
    );

    return result.rows[0];
  } catch (err: any) {
    console.error("Error creating call log:", err.message);
    throw new Error("Failed to insert call log.");
  }
};

// fetch all call logs with optional query parameters
export const getAllCallLogs = async (
  page: number,
  limit: number,
  contract_no: number | string,
  interpreter_no: number | string,
  lang_no: string,
  start_time: Date | string,
  end_time: Date | string,
  call_status: string
) => {
  console.log(155, start_time, end_time);

  try {
    const values: any[] = [];
    const conditions: string[] = [];

    // Apply filters dynamically
    if (contract_no !== "") {
      values.push(contract_no);
      conditions.push(`cli.contract_no = $${values.length}`);
    }

    if (interpreter_no !== "") {
      values.push(interpreter_no);
      conditions.push(`cli.interpreter_no = $${values.length}`);
    }

    if (lang_no) {
      values.push(lang_no);
      conditions.push(`cli.language_support_no = $${values.length}`);
    }

    if (call_status) {
      values.push(call_status);
      conditions.push(`cli.call_status = $${values.length}`);
    }

    if (start_time && !isNaN(new Date(start_time).getTime())) {
      values.push(start_time);
      conditions.push(`cli.call_start >= $${values.length}`);
    }

    if (end_time && !isNaN(new Date(end_time).getTime())) {
      values.push(end_time);
      conditions.push(`cli.call_end <= $${values.length}`);
    }

    // Prepare the count query
    let countQuery = `SELECT COUNT(*) FROM call_log_info AS cli`;
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    const countResult = await pool.query(countQuery, values);
    const totalRecords = parseInt(countResult.rows[0].count, 10);

    // Prepare the main data query
    let dataQuery = `
      SELECT 
          cli.*, 
          lsi.language_name, 
          CASE 
              WHEN ui_interpreter.user_type = 'interpreter' 
              THEN CONCAT(ui_interpreter.user_name_first, ' ', ui_interpreter.user_name_last) 
              ELSE NULL 
          END AS interpreter_name,
          CASE 
              WHEN ui_contract.user_type = 'contractor' 
              THEN CONCAT(ui_contract.user_name_first, ' ', ui_contract.user_name_last) 
              ELSE NULL 
          END AS contract_name,
          si_contract.store_name AS contract_store_name,
          ci_contract.company_name AS contract_company_name
      FROM call_log_info AS cli
      LEFT JOIN user_info AS ui_interpreter 
          ON cli.interpreter_no = ui_interpreter.user_no
      LEFT JOIN user_info AS ui_contract 
          ON cli.contract_no = ui_contract.user_no
      LEFT JOIN store_info AS si_contract 
          ON ui_contract.store_no = si_contract.store_no
      LEFT JOIN company_info AS ci_contract 
          ON si_contract.company_no = ci_contract.company_no
      LEFT JOIN languages_support_info AS lsi
          ON cli.language_support_no = lsi.languages_support_no
    `;

    if (conditions.length > 0) {
      dataQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Pagination and Sorting by call_log_no
    const offset = (page - 1) * limit;
    values.push(limit, offset);
    // Now sorting by `call_log_no` for correct order
    dataQuery += ` ORDER BY cli.call_log_no ASC LIMIT $${values.length - 1} OFFSET $${values.length}`;

    // Execute the query
    const result = await pool.query(dataQuery, values);
    return { totalRecords, callLogs: result.rows };
  } catch (err: any) {
    console.error("Error fetching call logs:", err.message);
    throw new Error("Failed to fetch call logs.");
  }
};
