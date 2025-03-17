import { Request, Response } from "express";
import * as storeModel from "../models/storeModel";
import { StoreData } from "../types/storeTypes";

// Handle creating a new store
export const createStoreController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const newStore = await storeModel.createStore(req.body);
    return res.status(201).json(newStore); // Return the created store with status 201
  } catch (err: any) {
    // Handle unique constraint violation (store number must be unique for each company)
    if (err.code === "23505") {
      return res.status(400).json({
        message: "Store number must be unique for each company",
      });
    }

    console.error("Error creating store:", err);
    return res.status(500).send("Server error");
  }
};

// Handle updating an existing store
export const updateStoreController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const storeNo = Number(req.params.storeNo); // Extract storeNo from the request params
  const storeData: StoreData = req.body; // Extract store data from the request body

  try {
    const updatedStore = await storeModel.updateStore(storeNo, storeData);
    if (!updatedStore) {
      return res.status(404).json({ message: "Store not found" });
    }
    return res.status(200).json(updatedStore); // Return the updated store
  } catch (err: any) {
    console.error("Error updating store:", err);
    return res.status(500).send("Server error");
  }
};

// Handle deleting stores
export const deleteStoresController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { store_nos } = req.body as { store_nos: number[] }; // Extract store IDs (array of numbers) from the request body

  try {
    const deletedStores = await storeModel.deleteStores(store_nos);
    if (deletedStores.length === 0) {
      return res.status(404).json({ message: "No stores found to delete" });
    }
    return res.status(200).json({
      message: "Stores deleted successfully",
      deleted: deletedStores,
    });
  } catch (err: any) {
    console.error("Error deleting stores:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Handle restoring deleting stores
export const restoreStoresController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { store_nos } = req.body as { store_nos: number[] }; // Extract store IDs (array of numbers) from the request body

  try {
    const restoredStores = await storeModel.restoreStores(store_nos);
    if (restoredStores.length === 0) {
      return res.status(404).json({ message: "No stores found to restore" });
    }
    return res.status(200).json({
      message: "Stores restored successfully",
      restored: restoredStores,
    });
  } catch (err: any) {
    console.error("Error restoring stores:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Handle fetching all stores
export const getAllStoresController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // console.log("Request Query:", req.query);

  const {
    page,
    limit,
    company_no,
    store_no_min,
    store_no_max,
    store_name,
    store_name_furigana,
  } = req.query;

  // Ensure that page and limit are valid numbers
  const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
  const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
  const companyNo = company_no ? Number(company_no) : "";
  const minStoreNo = store_no_min ? Number(store_no_min) : "";
  const maxStoreNo = store_no_max ? Number(store_no_max) : "";
  const storeName = typeof store_name === "string" ? store_name : "";
  const storeNameFurigana =
    typeof store_name_furigana === "string" ? store_name_furigana : "";

  try {
    const stores = await storeModel.getAllStores(
      pageNumber,
      limitNumber,
      companyNo,
      minStoreNo,
      maxStoreNo,
      storeName,
      storeNameFurigana
    );

    return res.status(200).json(stores);
  } catch (error: any) {
    console.error("Error fetching stores:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Handle fetching a single store by its ID
export const getStoreByStoreNoController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const storeNo = Number(req.params.storeNo); // Extract storeNo from the request params
  try {
    const store = await storeModel.getStoreByStoreNo(storeNo);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    return res.status(200).json(store); // Return the store details
  } catch (err: any) {
    console.error("Error fetching store:", err);
    return res.status(500).send("Server error");
  }
};

// Handle fetching store_no and store_name by company_no
export const getStoreDetailsByCompanyController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const companyNo = Number(req.params.companyNo);

  try {
    const storeDetails = await storeModel.getStoreDetailsByCompany(companyNo);
    if (storeDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No stores found for this company." });
    }

    return res.status(200).json(storeDetails); // Return the list of store details (store_no and store_name)
  } catch (err: any) {
    console.error("Error fetching store details by company:", err);
    return res.status(500).send("Server error");
  }
};
