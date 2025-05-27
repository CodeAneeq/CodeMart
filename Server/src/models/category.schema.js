import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    name: {type: String, required: true, unique:true},
    image: {type: String, required: true},
    adminId: {type: mongoose.Schema.Types.ObjectId, ref: "user"}
})

export const categoryModel = mongoose.model("category", categorySchema)