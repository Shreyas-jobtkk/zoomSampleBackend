import { Request, Response } from "express";
import * as companyModel from "../models/companyModel.js";

export const createCompany = async (req: Request, res: Response) => {
  const { company_name, company_name_furigana, company_note } = req.body;
  console.log(156, req.body);
  try {
    const company = await companyModel.createCompany({
      company_name,
      company_name_furigana,
      company_note,
    });
    res.status(201).json(company);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompany = async (req: Request, res: Response) => {
  const company_no = Number(req.params.company_no);
  try {
    const company = await companyModel.getCompanyById(company_no);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  const company_no = Number(req.params.company_no);
  const { company_name, company_name_furigana, company_note } = req.body;
  // console.log(2155, req.params, req.body);
  try {
    const company = await companyModel.updateCompany(company_no, {
      company_name,
      company_name_furigana,
      company_note,
    });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompanies = async (req: Request, res: Response) => {
  // console.log(189, req.body);
  const { company_nos } = req.body as { company_nos: number[] }; // Expecting an array of IDs
  // console.log(1892, req.body);
  try {
    const deletedCompanies = await companyModel.deleteCompanies(company_nos);
    if (deletedCompanies.length === 0) {
      return res.status(404).json({ message: "No companies found to delete" });
    }
    res.status(200).json({
      message: "Companies deleted successfully",
      deleted: deletedCompanies,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await companyModel.getAllCompanies();
    res.status(200).json(companies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyNames = async (req: Request, res: Response) => {
  try {
    const companies = await companyModel.getCompanyNumbersAndNames();
    res.status(200).json(companies);
  } catch (error: any) {
    console.error("Error fetching companies:", error); // Log the error for debugging
    res.status(500).json({ message: "Failed to fetch company name details." });
  }
};
