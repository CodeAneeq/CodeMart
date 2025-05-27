import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  products: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
      price: {type: Number, required: true},
      quantity: { type: Number, required: true }
    }
  ],
  paymentMethod: { type: String, default: "Cash On Delivery" },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Processing", "Shipping", "Delivered"]
  },
  address: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    area: { type: String, required: true },
    postalCode: { type: Number, required: true },
    phoneNumber: { type: Number, required: true },
    completeAddress: { type: String, required: true }
},
createdAt: { type: Date, default: Date.now }
});

export const orderModel = mongoose.model("order", orderSchema);