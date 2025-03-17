import { Request, Response } from "express";
import * as companyModel from "../models/companyModel.js";
import { CompanyData } from "../types/companyTypes";

// Controller to create a new company
export const createCompanyController = async (req: Request, res: Response) => {
  const { company_name, company_name_furigana, company_note }: CompanyData =
    req.body;
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

// Controller to get a company by its ID
export const getCompanyController = async (req: Request, res: Response) => {
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

// Controller to update a company by its ID
export const updateCompanyController = async (req: Request, res: Response) => {
  const company_no = Number(req.params.company_no);
  const { company_name, company_name_furigana, company_note }: CompanyData =
    req.body;
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

// Controller to delete companies based on an array of company IDs
export const deleteCompaniesController = async (
  req: Request,
  res: Response
) => {
  const { company_nos } = req.body as { company_nos: number[] }; // Expecting an array of IDs
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

// Controller to restore deleted companies based on an array of company IDs
export const restoreCompaniesController = async (
  req: Request,
  res: Response
) => {
  const { company_nos } = req.body as { company_nos: number[] }; // Expecting an array of IDs

  try {
    const restoredCompanies = await companyModel.restoreCompanies(company_nos);
    if (restoredCompanies.length === 0) {
      return res.status(404).json({ message: "No companies found to restore" });
    }
    res.status(200).json({
      message: "Companies restored successfully",
      restored: restoredCompanies,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to fetch all companies with optional query parameters for filtering and pagination
export const getAllCompaniesController = async (
  req: Request,
  res: Response
) => {
  // Destructuring query parameters with fallback values
  const {
    page,
    limit,
    company_no_min,
    company_no_max,
    company_name,
    company_name_furigana,
  } = req.query;

  // Ensure that page and limit are valid numbers
  const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
  const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
  const minCompanyNo = company_no_min ? Number(company_no_min) : "";
  const maxCompanyNo = company_no_max ? Number(company_no_max) : "";
  const companyName = typeof company_name === "string" ? company_name : "";
  const companyNameFurigana =
    typeof company_name_furigana === "string" ? company_name_furigana : "";

  try {
    const companies = await companyModel.getAllCompanies(
      pageNumber,
      limitNumber,
      minCompanyNo,
      maxCompanyNo,
      companyName,
      companyNameFurigana
    );

    res.status(200).json(companies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to fetch company numbers and names for selection options
export const getCompanyNamesController = async (
  req: Request,
  res: Response
) => {
  try {
    const companies = await companyModel.getCompanyNumbersAndNames();
    res.status(200).json(companies);
  } catch (error: any) {
    console.error("Error fetching companies:", error); // Log the error for debugging
    res.status(500).json({ message: "Failed to fetch company name details." });
  }
};
