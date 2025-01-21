export interface StoreData {
  company_no: string;
  store_name: string;
  store_name_furigana: string;
  zip: string;
  pref: string;
  city: string;
  street: string;
  building_name: string;
  tel: string;
  fax: string;
  store_note: string;
}

export interface StoreDetails {
  store_no: number;
  company_no: number;
  store_name: string;
  store_name_furigana: string;
  zip: string;
  pref: string;
  city: string;
  street: string;
  building_name: string;
  tel: string;
  fax: string;
  store_note: string;
  created_at: string;
  updated_at: string;
  store_delete: boolean;
}
