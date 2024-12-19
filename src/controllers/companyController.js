import * as companyModel from "../models/companyModel.js";

export const getCompany = async (req, res) => {
  const { id } = req.params;
  try {
    const company = await companyModel.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCompany = async (req, res) => {
  const { company_name, company_name_furigana, note } = req.body;
  try {
    const company = await companyModel.createCompany({
      company_name,
      company_name_furigana,
      note,
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { company_name, company_name_furigana, company_note } = req.body;
  try {
    const company = await companyModel.updateCompany(id, {
      company_name,
      company_name_furigana,
      company_note,
    });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompanies = async (req, res) => {
  const { ids } = req.body; // Expected to be an array of IDs
  try {
    const deletedCompanies = await companyModel.deleteCompanies(ids);
    if (deletedCompanies.length === 0) {
      return res.status(404).json({ message: "No companies found to delete" });
    }
    res.status(200).json({
      message: "Companies deleted successfully",
      deleted: deletedCompanies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanies = async (req, res) => {
  console.log(31422);
  try {
    const companies = await companyModel.getAllCompanies();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyNames = async (req, res) => {
  console.log(133);
  try {
    const companies = await companyModel.getCompanyNumbersAndNames();
    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error); // Log the error for debugging
    res.status(500).json({ message: "Failed to fetch company name details." });
  }
};
