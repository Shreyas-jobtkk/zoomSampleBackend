import * as userModel from "../models/userModel.js";
// import bcrypt from "bcrypt";

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  console.log(1256, req.body);

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

  // Hash the password before saving it
  // const hashedPassword = await bcrypt.hash(user_password, 10);

  try {
    // Ensure translate_languages is an array of integers
    const translatedLanguages = Array.isArray(translate_languages)
      ? translate_languages.map((lang) => parseInt(lang, 10)) // Ensure all elements are integers
      : [];

    // Set password_expire to 3 months from now if not provided
    const validPasswordExpire =
      password_expire && !isNaN(Date.parse(password_expire))
        ? new Date(password_expire) // Convert to Date object if valid
        : new Date(new Date().setMonth(new Date().getMonth() + 3)); // 3 months from now

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
      password_expire: validPasswordExpire, // Pass the corrected value
      user_password,
      meeting_id,
      meeting_passcode,
      user_note,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  console.log(144, req.body);
  const { id } = req.params;
  const {
    user_name_last,
    user_name_last_furigana, // New field
    user_name_first,
    user_name_first_furigana, // New field
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

  // Hash the password before saving it
  // const hashedPassword = await bcrypt.hash(user_password, 10);

  try {
    const user = await userModel.updateUser(id, {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUsers = async (req, res) => {
  const { ids } = req.body; // Array of user IDs to delete
  try {
    const deletedUsers = await userModel.deleteUsers(ids);
    if (deletedUsers.length === 0) {
      return res.status(404).json({ message: "No users found to delete" });
    }
    res.status(200).json({
      message: "Users deleted successfully",
      deleted: deletedUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllInterpreters = async (req, res) => {
  try {
    const users = await userModel.getAllInterpreters();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllContractors = async (req, res) => {
  try {
    const users = await userModel.getAllContractors();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContractorsAuth = async (req, res) => {
  const { mail_address, user_password } = req.body;
  console.log("Received credentials:", { mail_address, user_password });

  try {
    // Fetch the user from the database by email address
    const users = await userModel.getContractorsAuth(mail_address);

    console.log("valid credentials:", users);

    // Check if the user exists
    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Retrieve the first user (assuming unique mail_address)
    const user = users[0];
    const isPasswordValid = user_password === user.user_password;

    if (!isPasswordValid) {
      console.log(456, "failed");

      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // If the password is valid, return user details (do not send token)
    res.status(200).json({
      success: true,
      message: "valid credentials.",
      mail: mail_address,
    });
  } catch (error) {
    console.error("Controller error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to authenticate user." });
  }
};

export const getInterpretersAuth = async (req, res) => {
  console.log(156667, req.body);
  const { mail_address, user_password } = req.body;
  console.log("Received credentials:", { mail_address, user_password });

  try {
    // Fetch the user from the database by email address
    const users = await userModel.getInterpretersAuth(mail_address);

    console.log("valid credentials:", users);

    // Check if the user exists
    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Retrieve the first user (assuming unique mail_address)
    const user = users[0];
    const isPasswordValid = user_password === user.user_password;

    if (!isPasswordValid) {
      console.log(456, "failed");

      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // If the password is valid, return user details (do not send token)
    res.status(200).json({
      success: true,
      message: "valid credentials.",
      mail: mail_address,
    });
  } catch (error) {
    console.error("Controller error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to authenticate user." });
  }
};

export const getAdministratorsAuth = async (req, res) => {
  console.log(156667, req.body);
  const { mail_address, user_password } = req.body;
  console.log("Received credentials:", { mail_address, user_password });

  try {
    // Fetch the user from the database by email address
    const users = await userModel.getAdministratorsAuth(mail_address);

    console.log("valid credentials:", users);

    // Check if the user exists
    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Retrieve the first user (assuming unique mail_address)
    const user = users[0];
    const isPasswordValid = user_password === user.user_password;

    if (!isPasswordValid) {
      console.log(456, "failed");

      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // If the password is valid, return user details (do not send token)
    res.status(200).json({
      success: true,
      message: "valid credentials.",
      mail: mail_address,
    });
  } catch (error) {
    console.error("Controller error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to authenticate user." });
  }
};

export const getAllAdministrators = async (req, res) => {
  try {
    const users = await userModel.getAllAdministrators();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserNames = async (req, res) => {
  try {
    const users = await userModel.getUserNumbersAndNames();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user names" });
  }
};
