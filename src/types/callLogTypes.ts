export interface CallLogData {
  interpreter_no: number;
  languages_support_no: number;
  contract_no: string;
  call_dial?: string | null; // Optional, as some calls may not have this timestamp
  call_canceled?: string | null;
  call_start?: string | null;
  call_end?: string | null;
  call_status: string;
  feed_back?: number | null; // Optional, as feedback may not be available
}
