export interface UserData {
  store_no: string;
  user_name_last: string;
  user_name_last_furigana: string;
  user_name_first: string;
  user_name_first_furigana: string;
  user_type: string;
  mail_address: string;
  tel: string;
  tel_extension: string;
  translate_languages: number[];
  password_expire: Date;
  user_password: string;
  meeting_id: string;
  meeting_passcode: string;
  user_note: string;
}

export interface UpdateUserData {
  user_name_last: string;
  user_name_last_furigana: string;
  user_name_first: string;
  user_name_first_furigana: string;
  mail_address: string;
  tel: string;
  tel_extension: string;
  translate_languages: number[];
  user_password: string;
  meeting_id: string;
  meeting_passcode: string;
  user_note: string;
  store_no: string;
}

export interface User {
  user_no: number;
  store_no: number;
  user_name_last: string;
  user_name_last_furigana: string;
  user_name_first: string;
  user_name_first_furigana: string;
  user_type: string;
  mail_address: string;
  tel: string;
  tel_extension: string;
  translate_languages: number[];
  password_expire: Date;
  user_password: string;
  meeting_id: string;
  meeting_passcode: string;
  user_note: string;
  created_at: string;
  updated_at: string;
}

export interface AuthBody {
  mail_address: string;
  user_password: string;
}
