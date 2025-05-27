import mongoose, { Schema } from "mongoose";

const ratingSchema = new Schema({
  review: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

export const ratingModel = mongoose.model("rating", ratingSchema);
