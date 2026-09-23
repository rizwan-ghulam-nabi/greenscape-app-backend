import Address from "../models/Address.js";

// @desc    Get all addresses for the logged-in user
// @route   GET /api/addresses
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ success: false, message: "Server error fetching addresses" });
  }
};

// @desc    Create a new address
// @route   POST /api/addresses
export const createAddress = async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const existingAddresses = await Address.find({ user: req.user.id });
    if (existingAddresses.length === 0) {
      req.body.isDefault = true;
    }

    const newAddress = new Address({
      ...req.body,
      user: req.user.id,
    });

    const savedAddress = await newAddress.save();
    res.status(201).json({ success: true, address: savedAddress });
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({ success: false, message: error.message || "Server error creating address" });
  }
};

// @desc    Update an existing address
// @route   PUT /api/addresses/:id
export const updateAddress = async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, address: updatedAddress });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: error.message || "Server error updating address" });
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
export const deleteAddress = async (req, res) => {
  try {
    const deletedAddress = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deletedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (deletedAddress.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user.id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: "Server error deleting address" });
  }
};

// @desc    Set an address as the default
// @route   PUT /api/addresses/:id/default
export const setDefaultAddress = async (req, res) => {
  try {
    await Address.updateMany({ user: req.user.id }, { isDefault: false });

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, address: updatedAddress });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ success: false, message: "Server error setting default" });
  }
};