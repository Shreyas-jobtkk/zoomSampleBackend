import storeModel from "../models/storeModel.js"; // Import the store model

// Handle creating a new store
async function createStoreController(req, res) {
  try {
    const newStore = await storeModel.createStore(req.body);
    res.status(201).json(newStore); // Return the created store with status 201
  } catch (err) {
    // Handle unique constraint violation
    if (err.code === "23505") {
      return res.status(400).json({
        message: "Store number must be unique for each company",
      });
    }

    console.error("Error creating store:", err);
    res.status(500).send("Server error");
  }
}

// Handle fetching all stores
async function getAllStoresController(req, res) {
  try {
    const stores = await storeModel.getAllStores();

    if (stores.length === 0) {
      return res.status(404).json({
        message: "No stores found",
      });
    }

    res.json(stores); // Return the list of stores
  } catch (err) {
    console.error("Error fetching stores:", err);
    res.status(500).send("Server error");
  }
}

export { createStoreController, getAllStoresController };
