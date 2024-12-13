import * as companyModel from "../models/companyModel.js";

export const getCompanies = async (req, res) => {
  try {
    const companies = await companyModel.getAllCompanies();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

// // controllers/companyController.js
// import { getAllCompanies } from "../models/companyModel.js"; // Import the model function

// function getAllCompaniesController(req, res) {
//   getAllCompanies()
//     .then(function (companies) {
//       res.status(200).json(companies);
//       console.log(146, companies); // Logging for debugging, you might want to remove in production
//     })
//     .catch(function (error) {
//       console.error("Error fetching companies:", error);
//       res.status(500).json({ error: "Failed to fetch companies." });
//     });
// }

// export { getAllCompaniesController };
