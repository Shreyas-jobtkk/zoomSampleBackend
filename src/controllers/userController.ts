import * as userModel from "../models/userModel";
import { Request, Response } from "express";
import { AuthBody } from "../types/userTypes";

export const createUser = async (req: Request, res: Response) => {
  const {
    store_no,
    user_name_last,
    user_name_last_furigana,
    user_name_first,
    user_name_first_furigana,
    user_type,
    mail_address,
    tel,
    tel_extension,
    translate_languages,
    password_expire,
    user_password,
    meeting_id,
    meeting_passcode,
    user_note,
  } = req.body;

  try {
    const translatedLanguages = Array.isArray(translate_languages)
      ? translate_languages.map((lang) => parseInt(lang as string, 10))
      : [];

    const user = await userModel.createUser({
      store_no,
      user_name_last,
      user_name_last_furigana,
      user_name_first,
      user_name_first_furigana,
      user_type,
      mail_address,
      tel,
      tel_extension,
      translate_languages: translatedLanguages,
      password_expire,
      user_password,
      meeting_id,
      meeting_passcode,
      user_note,
    });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const userNo = Number(req.params.userNo);
  try {
    const user = await userModel.getUserById(userNo);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
  // console.log(156, Number(req.params.userNo));
};

export const updateUser = async (req: Request, res: Response) => {
  const userNo = Number(req.params.userNo);
  const {
    user_name_last,
    user_name_last_furigana,
    user_name_first,
    user_name_first_furigana,
    mail_address,
    tel,
    tel_extension,
    translate_languages,
    user_password,
    meeting_id,
    meeting_passcode,
    user_note,
    store_no,
  } = req.body;

  try {
    const user = await userModel.updateUser(userNo, {
      user_name_last,
      user_name_last_furigana,
      user_name_first,
      user_name_first_furigana,
      mail_address,
      tel,
      tel_extension,
      translate_languages,
      user_password,
      meeting_id,
      meeting_passcode,
      user_note,
      store_no,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInterpretersStatus = async (req: Request, res: Response) => {
  const interpreter_no = req.params.interpreterNo;
  const { interpreter_status } = req.body;

  if (!interpreter_no || !interpreter_status) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const user = await userModel.updateInterpretersStatus(
      interpreter_no,
      interpreter_status
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error updating interpreter status:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteUsers = async (req: Request, res: Response) => {
  // const { ids }: DeleteUsersBody = req.body; // Array of user IDs to delete
  const { user_nos } = req.body as { user_nos: number[] };
  try {
    const deletedUsers = await userModel.deleteUsers(user_nos);
    if (deletedUsers.length === 0) {
      return res.status(404).json({ message: "No users found to delete" });
    }
    res.status(200).json({
      message: "Users deleted successfully",
      deleted: deletedUsers,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export const restoreUsersController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { user_nos } = req.body as { user_nos: number[] }; // Extract user IDs (array of numbers) from the request body

  try {
    const restoredUsers = await userModel.restoreUsers(user_nos);
    if (restoredUsers.length === 0) {
      return res.status(404).json({ message: "No users found to restore" });
    }
    return res.status(200).json({
      message: "Users restored successfully",
      restored: restoredUsers,
    });
  } catch (err: any) {
    console.error("Error restoring users:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getAllInterpreters = async (req: Request, res: Response) => {
  // console.log("Request Query:", req.query);
  const {
    page,
    limit,
    company_no,
    store_no,
    interpreter_no_min,
    interpreter_no_max,
    interpreter_name_first,
    interpreter_name_furigana_first,
    interpreter_name_last,
    interpreter_name_furigana_last,
    languages,
  } = req.query;

  // Ensure that page and limit are valid numbers
  const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
  const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
  const companyNo = company_no ? Number(company_no) : "";
  const storeNo = store_no ? Number(store_no) : "";
  const minInterpreterNo = interpreter_no_min ? Number(interpreter_no_min) : "";
  const maxInterpreterNo = interpreter_no_max ? Number(interpreter_no_max) : "";
  const interpreterFirstName =
    typeof interpreter_name_first === "string" ? interpreter_name_first : "";
  const interpreterFirstNameFurigana =
    typeof interpreter_name_furigana_first === "string"
      ? interpreter_name_furigana_first
      : "";
  const interpreterLastName =
    typeof interpreter_name_last === "string" ? interpreter_name_last : "";
  const interpreterLastNameFurigana =
    typeof interpreter_name_furigana_last === "string"
      ? interpreter_name_furigana_last
      : "";

  let interpreterLanguages: string[] = [];
  if (
    Array.isArray(languages) &&
    languages.every((lang) => typeof lang === "string")
  ) {
    // console.log(444, languages);
    interpreterLanguages = languages;
  }

  try {
    const interpreters = await userModel.getAllInterpreters(
      pageNumber,
      limitNumber,
      companyNo,
      storeNo,
      minInterpreterNo,
      maxInterpreterNo,
      interpreterFirstName,
      interpreterFirstNameFurigana,
      interpreterLastName,
      interpreterLastNameFurigana,
      interpreterLanguages
    );

    return res.status(200).json(interpreters);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export const getAllContractors = async (req: Request, res: Response) => {
  const {
    page,
    limit,
    company_no,
    store_no,
    contractor_no_min,
    contractor_no_max,
    contractor_name_first,
    contractor_name_furigana_first,
    contractor_name_last,
    contractor_name_furigana_last,
  } = req.query;

  // Ensure that page and limit are valid numbers
  const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
  const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
  const companyNo = company_no ? Number(company_no) : "";
  const storeNo = store_no ? Number(store_no) : "";
  const minContractorNo = contractor_no_min ? Number(contractor_no_min) : "";
  const maxContractorNo = contractor_no_max ? Number(contractor_no_max) : "";
  const contractorFirstName =
    typeof contractor_name_first === "string" ? contractor_name_first : "";
  const contractorFirstNameFurigana =
    typeof contractor_name_furigana_first === "string"
      ? contractor_name_furigana_first
      : "";
  const contractorLastName =
    typeof contractor_name_last === "string" ? contractor_name_last : "";
  const contractorLastNameFurigana =
    typeof contractor_name_furigana_last === "string"
      ? contractor_name_furigana_last
      : "";

  try {
    const contractors = await userModel.getAllContractors(
      pageNumber,
      limitNumber,
      companyNo,
      storeNo,
      minContractorNo,
      maxContractorNo,
      contractorFirstName,
      contractorFirstNameFurigana,
      contractorLastName,
      contractorLastNameFurigana
    );

    return res.status(200).json(contractors);
  } catch (error: any) {
    console.error("Error fetching contractors:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllAdministrators = async (req: Request, res: Response) => {
  const {
    page,
    limit,
    company_no,
    store_no,
    admin_no_min,
    admin_no_max,
    admin_name_first,
    admin_name_furigana_first,
    admin_name_last,
    admin_name_furigana_last,
  } = req.query;

  // Ensure that page and limit are valid numbers
  const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
  const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
  const companyNo = company_no ? Number(company_no) : "";
  const storeNo = store_no ? Number(store_no) : "";
  const minAdminNo = admin_no_min ? Number(admin_no_min) : "";
  const maxAdminNo = admin_no_max ? Number(admin_no_max) : "";
  const adminFirstName =
    typeof admin_name_first === "string" ? admin_name_first : "";
  const adminFirstNameFurigana =
    typeof admin_name_furigana_first === "string"
      ? admin_name_furigana_first
      : "";
  const adminLastName =
    typeof admin_name_last === "string" ? admin_name_last : "";
  const adminLastNameFurigana =
    typeof admin_name_furigana_last === "string"
      ? admin_name_furigana_last
      : "";

  try {
    const administrators = await userModel.getAllAdministrators(
      pageNumber,
      limitNumber,
      companyNo,
      storeNo,
      minAdminNo,
      maxAdminNo,
      adminFirstName,
      adminFirstNameFurigana,
      adminLastName,
      adminLastNameFurigana
    );

    return res.status(200).json(administrators);
  } catch (error: any) {
    console.error("Error fetching administrators:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getContractorsAuth = async (req: Request, res: Response) => {
  const { mail_address, user_password }: AuthBody = req.body;
  try {
    // Fetch the user from the database by email address
    const users = await userModel.getContractorsAuth(mail_address);

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = users[0];
    // console.log(155, user);
    const isPasswordValid = user_password === user.user_password;

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "valid credentials.",
      user_no: user.user_no,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Controller error:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to authenticate user." });
    } else {
      res
        .status(500)
        .json({ success: false, message: "An unexpected error occurred." });
    }
  }
};

export const getInterpretersAuth = async (req: Request, res: Response) => {
  const { mail_address, user_password }: AuthBody = req.body;
  try {
    const users = await userModel.getInterpretersAuth(mail_address);

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = users[0];
    const isPasswordValid = user_password === user.user_password;

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "valid credentials.",
      user_no: user.user_no,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Controller error:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to authenticate user." });
    } else {
      res
        .status(500)
        .json({ success: false, message: "An unexpected error occurred." });
    }
  }
};

export const getAdministratorsAuth = async (req: Request, res: Response) => {
  const { mail_address, user_password }: AuthBody = req.body;
  try {
    const users = await userModel.getAdministratorsAuth(mail_address);

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = users[0];
    const isPasswordValid = user_password === user.user_password;

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "valid credentials.",
      user_no: user.user_no,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Controller error:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to authenticate user." });
    } else {
      res
        .status(500)
        .json({ success: false, message: "An unexpected error occurred." });
    }
  }
};
