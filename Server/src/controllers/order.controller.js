import { orderModel } from "../models/order.schema.js";
import { productModel } from "../models/product.schema.js";

const createOrder = async (req, res) => {
    try {
        let user = req.user
        let { paymentMethod, products, address} = req.body;
        let { name, email, city, state, area, postalCode, phoneNumber, completeAddress } = address || {};

        if (!products || !name || !email || !city || !state || !area || !postalCode || !phoneNumber || !completeAddress) {
            return res.status(400).json({status: "failed",  message: "All fields are required"})
        }

        if (user.role === 'admin') {
             return res.status(400).json({status: "failed",  message: "Admin Cant create order"})
        }

        let newOrder = new orderModel({
            userId: user._id,
            products,
            paymentMethod,
            address: {
                name,
                email,
                city,
                state,
                area,
                postalCode,
                phoneNumber,
                completeAddress,
            }
        })

        await newOrder.save()
        res.status(200).json({status: "success", message: "Order has been created", data: newOrder})


    } catch (error) {
        console.log(error.message);
        res.status(500).json({status: "failed", message: "Internal Server Error", error: error.message})
    }
}

const changeStatusByAdmin = async (req, res) => {
    try {
        let { status, orderId } = req.body;
        if (!status) {
            return res.status(400).json({status: "failed", message: "All fields required"})
        }
        let order = await orderModel.findByIdAndUpdate(orderId, {status}, {new: true});
        // product.status = status
        await order.save();
        res.status(200).json({status: "success", message: "Status Change Successfully", data: order})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({status: "failed", message: "Internal Server Error"})
    }
}

const getOrders = async (req, res) => {
    try {
          let page = parseInt(req.query.page) || 1;
                let size = parseInt(req.query.size) || 10;
        
                let skip = (page - 1) * size;
        
                let user = req.user
                let { status } = req.query;
                let filter = {};
                
                
                if (user.role == "user") {
                    filter.userId = user._id;
                }        
                
                if (status) {
                    filter.status = status
                }        
                
                // const order = await orderModel.find(filter)
                let orders = await orderModel.find(filter)
                .skip(skip)
                .limit(size)
        
                let totalOrderCount = await orderModel.countDocuments();
                let totalPages = Math.ceil(totalOrderCount / size);
    
    res.status(200).json({
      status: "success",
      message: "Orders fetched successfully",
      data: orders,
      pagination: {
        page,
        size,
        totalPages,
        totalOrders: totalOrderCount,
      },
    });        
    } catch (error) {
         console.log(error);
        res.status(500).json({status: "failed", message: "Internal Server Error"})
    }
}

export { createOrder, changeStatusByAdmin, getOrders  }