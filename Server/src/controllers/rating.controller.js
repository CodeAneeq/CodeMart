import { orderModel } from "../models/order.schema.js";
import { productModel } from "../models/product.schema.js";
import { ratingModel } from "../models/rating.schema.js";

const validateUserOrder = async ({ userId, productId }) => {
  let order = await orderModel.find({
    userId: userId,
    products: { $elemMatch: { id: productId } },
  });
  return order.length > 0;
};
const updateProductRating = async ({ productId }) => {
  let review = await ratingModel.find({ productId: productId });
  let reviewLength = review.length ?? 0;
   if (reviewLength === 0) {
    // Agar koi review nahi, toh rating ko 0 ya null set karo
    await productModel.findByIdAndUpdate(productId, { rating: 0 });
    return;
  }
  let sum = review.reduce((sum, review) => {
    return sum + review.rating;
  }, 0);
  let avgRating = Math.round(sum / reviewLength);
  await productModel.findByIdAndUpdate(productId, { rating: avgRating });
};

const createRating = async (req, res) => {
  try {
    let { productId, review, rating } = req.body;
    if (!productId || !review || !rating) {
      return res
        .status(400)
        .json({ status: "failed", message: "All Fields are required" });
    }
    let product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(400)
        .json({ status: "failed", message: "Product Not Found" });
    }

    let hasOrder = await validateUserOrder({
      userId: req?.user?._id,
      productId: productId,
    });

    if (!hasOrder) {
      return res
        .status(403)
        .json({
          status: "failed",
          message: "You are unauthorize, first place order then rate",
        });
    }

    await updateProductRating(productId);

    let newRating = new ratingModel({
      rating: parseInt(rating),
      review,
      productId,
      userId: req.user._id,
    });
    await newRating.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "Rating Create Successfully",
        data: newRating,
      });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal Server Error" });
  }
};

const deleteRating = async (req, res) => {
  try {
    let { ratingId } = req.params;
    if (!ratingId) {
      return res
        .status(400)
        .json({ status: "failed", message: "All Fields are required" });
    }

    let rating = await ratingModel.findById(ratingId);
    if (!rating) {
      return res
        .status(404)
        .json({ status: "failed", message: "Rating not found" });
    }

    if (rating.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res
        .status(400)
        .json({ status: "failed", message: "Unauthorized cant remove rating" });
    }

    const { productId } = rating;
    await ratingModel.findByIdAndDelete(ratingId);
    await updateProductRating(productId);

    res
      .status(200)
      .json({ status: "success", message: "Rating Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal Server Error" });
  }
};

const getRatings = async (req, res) => {
  try {
    let { productId } = req.params;
    if (!productId) {
      return res
        .status(400)
        .json({ status: "success", message: "Product Id must Required" });
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: "success", message: "Product Not Found" });
    }
 const reviews = await ratingModel.find({ productId })
      .populate('userId', 'name');
      
    res
      .status(200)
      .json({
        status: "success",
        message: "Ratings Fetch Successfully",
        data: reviews,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal Server Error" });
  }
};

const getAllRating = async (req, res) => {
  try {
    let ratings = await ratingModel.find();
    res
      .status(200)
      .json({ status: "Success", message: "All Ratings Fetch Successfully", data: ratings });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Failed", message: "Internal Server Error" });
  }
}

export {createRating, deleteRating, getRatings, getAllRating}