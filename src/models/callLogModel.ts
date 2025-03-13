import pool from "../db.js";
import { CallLogData } from "../types/callLogTypes";

export const createCallLog = async (callLogData: CallLogData) => {
  // console.log(157, callLogData);

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

export const getCallLogData = async () => {
  const query = `
  SELECT 
      cli.*,  -- Select all columns from call_log_info
      lsi.language_name, -- Fix column reference

      -- Get interpreter's full name
      CASE 
          WHEN ui_interpreter.user_type = 'interpreter' THEN CONCAT(ui_interpreter.user_name_first, ' ', ui_interpreter.user_name_last)
          ELSE NULL
      END AS interpreter_name,

      -- Get contractor's details (only if user_type is 'contractor')
      CASE 
          WHEN ui_contract.user_type = 'contractor' THEN 
              CONCAT(ui_contract.user_name_first, ' ', ui_contract.user_name_last)
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
      ON ui_contract.store_no = si_contract.store_no  -- Corrected the join condition
  LEFT JOIN company_info AS ci_contract 
      ON si_contract.company_no = ci_contract.company_no
  LEFT JOIN languages_support_info AS lsi
      ON cli.language_support_no = lsi.languages_support_no  -- Added a proper join condition

  WHERE ui_contract.user_type = 'contractor' OR ui_contract.user_type IS NULL;



   `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (err: any) {
    console.error("Error fetching all call_log_info:", err.message);
    throw new Error("Failed to fetch call_log_info.");
  }
};
