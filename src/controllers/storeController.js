import storeModel from "../models/storeModel.js"; // Import the store model

// Handle creating a new store
export const createStoreController = async (req, res) => {
  try {
    const newStore = await storeModel.createStore(req.body);
    res.status(201).json(newStore); // Return the created store with status 201
  } catch (err) {
    // Handle unique constraint violation (store number must be unique for each company)
    if (err.code === "23505") {
      return res.status(400).json({
        message: "Store number must be unique for each company",
      });
    }

    console.error("Error creating store:", err);
    res.status(500).send("Server error");
  }
};

// Handle updating an existing store
export const updateStoreController = async (req, res) => {
  const { storeNo } = req.params; // Extract storeNo from the request params
  const storeData = req.body; // Extract store data from the request body

  console.log(147, storeData);

  try {
    const updatedStore = await storeModel.updateStore(storeNo, storeData);
    if (!updatedStore) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(updatedStore); // Return the updated store
  } catch (err) {
    console.error("Error updating store:", err);
    res.status(500).send("Server error");
  }
};

// Handle deleting stores
// Handle deleting stores
export const deleteStoresController = async (req, res) => {
  const { ids } = req.body; // Extract store IDs (array of numbers) from the request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "Please provide an array of store IDs to delete" });
  }

  try {
    const deletedStores = await storeModel.deleteStores(ids);
    if (deletedStores.length === 0) {
      return res.status(404).json({ message: "No stores found to delete" });
    }
    res.status(200).json({
      message: "Stores deleted successfully",
      deleted: deletedStores,
    });
  } catch (err) {
    console.error("Error deleting stores:", err);
    res.status(500).json({ message: err.message });
  }
};

// Handle fetching all stores
export const getAllStoresController = async (req, res) => {
  try {
    const stores = await storeModel.getAllStores();

    if (stores.length === 0) {
      return res.status(404).json({
        message: "No stores found",
      });
    }

    res.status(200).json(stores); // Return the list of stores
  } catch (err) {
    console.error("Error fetching stores:", err);
    res.status(500).send("Server error");
  }
};

// Handle fetching a single store by its ID
export const getStoreByIdController = async (req, res) => {
  const { storeNo } = req.params; // Extract storeNo from the request params

  try {
    const store = await storeModel.getStoreById(storeNo);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(store); // Return the store details
  } catch (err) {
    console.error("Error fetching store:", err);
    res.status(500).send("Server error");
  }
};

// Handle fetching store_no and store_name by company_no
export const getStoreDetailsByCompanyController = async (req, res) => {
  const { companyNo } = req.params; // Extract companyNo from the request params

  try {
    const storeDetails = await storeModel.getStoreDetailsByCompany(companyNo);
    if (storeDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No stores found for this company." });
    }
    res.status(200).json(storeDetails); // Return the list of store details (store_no and store_name)
  } catch (err) {
    console.error("Error fetching store details by company:", err);
    res.status(500).send("Server error");
  }
};

export default {
  createStoreController,
  updateStoreController,
  deleteStoresController,
  getAllStoresController,
  getStoreByIdController,
  getStoreDetailsByCompanyController,
};
