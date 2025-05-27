import { cloudinary } from "../config/cloudinary.config.js";
import { categoryModel } from "../models/category.schema.js";

const createCategory = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "failed", message: "Please Upload a file" });
    }
    let { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ status: "failed", message: "All fields are required" });
    }
    let existedCategory = await categoryModel.find({ name: name });
    if (existedCategory.length > 0) {
      return res
        .status(400)
        .json({ status: "failed", message: "Category already exist" });
    }
    let newCategory = new categoryModel({
      name,
      image: req.file.path,
      adminId: req.user._id,
    });
    await newCategory.save();
    res
      .status(201)
      .json({
        status: "success",
        message: "Category Created",
        data: newCategory,
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
    console.log(error);
  }
};

const getAllCategories = async (req, res) => {
  try {
    let categories = await categoryModel.find();
    res
      .status(200)
      .json({
        status: "success",
        message: "Categories fetch successfully",
        data: categories,
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
    console.log(error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    let id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ status: "failed", message: "Id must required" });
    }
    const category = await categoryModel.findById(id);
    if (!category) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Category Not Found" });
    }
    
    const getPublicIdFromUrl = (url) => {
        if (!url) return null;
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        const publicId = filename.split(".")[0];
        
        return publicId;
    };
    
    await cloudinary.api.delete_resources([getPublicIdFromUrl(category.image)]);
    const delCategory = await categoryModel.findByIdAndDelete(id);
    res
    .status(200)
    .json({
        status: "success",
        message: "Category Delete successfully",
        data: delCategory,
      });
  } catch (error) {
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
    console.log(error);
  }
};

export { createCategory, getAllCategories, deleteCategory };
