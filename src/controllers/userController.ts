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
  console.log(156, Number(req.params.userNo));
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
  const mail_id = req.params.mail;
  const { interpreter_status } = req.body;

  if (!mail_id || !interpreter_status) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const user = await userModel.updateInterpretersStatus(
      mail_id,
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

export const getAllInterpreters = async (req: Request, res: Response) => {
  try {
    const users = await userModel.getAllInterpreters();
    res.status(200).json(users);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};

export const getAllContractors = async (req: Request, res: Response) => {
  try {
    const users = await userModel.getAllContractors();
    res.status(200).json(users);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
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
    const isPasswordValid = user_password === user.user_password;

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "valid credentials.",
      mail: mail_address,
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
      mail: mail_address,
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
      mail: mail_address,
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

export const getAllAdministrators = async (req: Request, res: Response) => {
  try {
    const users = await userModel.getAllAdministrators();
    res.status(200).json(users);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
};
