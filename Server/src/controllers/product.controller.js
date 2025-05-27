import { cloudinary } from "../config/cloudinary.config.js";
import { categoryModel } from "../models/category.schema.js";
import { productModel } from "../models/product.schema.js";

const createProduct = async (req, res) => {
    try {
        let { name, details, price, stock, rating, categoryId } = req.body;
        if (!name || !details || !price || !stock || !categoryId) {
            return res.status(400).json({status: "Failed", message: "All Fields are required"});
        }
        if (!req.files) {
            return res.status(400).json({status: "Failed", message: "Images are required"});
        }
        const category = await categoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({status: "Failed", message: "Category not Found"});            
        }
        let urls = req.files.map(file => file.path);
        
        let newProduct = new productModel({
            name,
            images: urls,
            details,
            price,
            stock,
            rating,
            categoryId,
            adminId: req.user._id
        })
        await newProduct.save();
        res.status(201).json({status: "Success", message: "Product Created Successfully", data:newProduct });
    } catch (error) {
        res.status(500).json({status: "Failed", message: "Internal Server Error", error: error.message});
    }
}

const deleteProduct = async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) {
          return res.status(400).json({status: "Failed", message: "All Fields are required"});   
        }
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(400).json({status: "Failed", message: "Product Not Found"});
        }
        const imgsUrl = product.images.map((url) => {
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            return filename.split(".")?.[0];
        })
        await cloudinary.api.delete_resources(imgsUrl);
        await productModel.findByIdAndDelete(id);

        res.status(200).json({status: "Success", message: "Product Deleted Successfully", data: product });
    } catch (error) {
        console.log(error);
        
     res.status(500).json({status: "Failed", message: "Internal Server Error", error: error});
    }
}

const updateProduct = async (req, res) => {
    try {
          let { id } = req.params;
          let { name, details, price, stock, categoryId } = req.body;
        if (!name || !details || !price || !stock || !categoryId) {
            return res.status(400).json({status: "Failed", message: "All Fields are required"});
        }
        if (!req.files) {
            return res.status(400).json({status: "Failed", message: "Images are required"});
        }
        let product = await productModel.findById(id);
        if (name) product.name = name;
        if (details) product.details = details;
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if (categoryId) product.categoryId = categoryId;

        if (req.files && req.files > 0) {
            
             const imgsUrl = product.images.map((url) => {
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            return filename.split(".")?.[0];
        })
            await cloudinary.api.delete_resources(imgsUrl);
            const imgs = req.files.map(file => file.path)
            product.images = imgs

        }
        
        await product.save()
        res.status(200).json({status: "Success", message: "Product Updated Successfully", data: product });
    } catch (error) {
       console.log(error);
       res.status(500).json({status: "Failed", message: "Internal Server Error", error: error});

    }
}

const getProducts = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let size = parseInt(req.query.size);

        let skip = (page - 1) * size;

        let products = await productModel.find()
        .skip(skip)
        .limit(size);

        let totalProductsCount = await productModel.countDocuments();
        let totalPages = Math.ceil(totalProductsCount / size);
        
        res.status(200).json({status: "success", message: "All Products fetch Successfully", data: products, pagination: {
            totalProductsCount: totalProductsCount,
            totalPages:  totalPages,
            currentPage: page,
            pageSize: size
        }})
    } catch (error) {
        console.log(error);
       res.status(500).json({status: "Failed", message: "Internal Server Error", error: error});
    }
}
const getSingleProduct = async (req, res) => {
    try {
        let id = req.params.id
        let singleProduct = await productModel.findById(id);
        res.status(200).json({status: "success", message: "SIngle Products fetch Successfully", data: singleProduct})
    } catch (error) {
        console.log(error);
       res.status(500).json({status: "Failed", message: "Internal Server Error", error: error});
    }
}

const searchProduct = async (req, res) => {
    try {
       let keyword = (req.query.search || "").trim();

        let products = await productModel.find({name: {$regex: keyword, $options: 'i'}});
        res.status(200).json({status: 'success', data: products})
    } catch (error) {
        console.log(error);
        res.status(500).json({status: "failed", message: "Internal Server Error"})
    }
}

export {createProduct, deleteProduct, updateProduct, getProducts, getSingleProduct, searchProduct}