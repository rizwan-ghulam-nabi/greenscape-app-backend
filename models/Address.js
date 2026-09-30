import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["home", "office", "parents", "gift", "other"],
      default: "home",
    },
    label: {
      type: String,
      required: [true, "Please provide a label (e.g. Home, Office)"],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Please provide the full name"],
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, "Please provide address line 1"],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "Please provide a city"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "Please provide a state/region"],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, "Please provide a postal code"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Please provide a country"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


AddressSchema.index({ user: 1 });
AddressSchema.index({ user: 1, isDefault: -1 });

const Address = mongoose.model("Address", AddressSchema);
export default Address;