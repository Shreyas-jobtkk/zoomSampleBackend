// Define the Language type
export interface Language {
  language_name: string;
  language_name_furigana: string;
  language_note: string;
}

export interface LanguageWithId extends Language {
  languages_support_no: number;
  created_at: string;
  updated_at: string;
  language_deleted: boolean;
}
