import { orderModel } from "../models/order.schema.js";
import { productModel } from "../models/product.schema.js";
import Stripe from "stripe";
import Constants from '../constant.js';

const stripe = new Stripe(Constants.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  let event;
    const signature = req.headers['stripe-signature'];
  
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        Constants.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
    console.log(event);
    

  // Handle the event
  if (event.type == "checkout.session.completed") {
    const session = event.data.object;
    console.log("Payment Successfull", session.id);
    const order = await orderModel.findOneAndUpdate({stripeSessionId: session.id}, {status: "Paid"}, {new: true});
    console.log("updated order ===========>", order);
  } else if (event.type == "checkout.session.async_payment_failed" || event.type == "checkout.session.expired")
  {
    const session = event.data.object;
    console.log("Payment failed", session.id);
    const order = await orderModel.findOneAndUpdate({stripeSessionId: session.id}, {status: "Fail"}, {new: true});
    console.log("Failed Oredr", order);
  }
  

  // Return a response to acknowledge receipt of the event
  res.json({received: true});

}

const createOrder = async (req, res) => {
    try {
        let user = req.user
        let { paymentMethod, products, address } = req.body;
        console.log(paymentMethod);
        
        let { name, email, city, state, area, postalCode, phoneNumber, completeAddress } = address || {};

        if (!products || !name || !email || !city || !state || !area || !postalCode || !phoneNumber || !completeAddress) {
            return res.status(400).json({ status: "failed", message: "All fields are required" })
        }

        if (paymentMethod == "cash") {
            if (user.role === 'admin') {
                return res.status(400).json({ status: "failed", message: "Admin Cant create order" })
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
            res.status(200).json({ status: "success", message: "Order has been created", data: newOrder })
        } else {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map((item) => ({
                price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [item.images[0]]
                },
                unit_amount: item.price * 100,
            },
                quantity: item.quantity
                })),
                mode: "payment",
                success_url: `${Constants.CLIENT_URL}/my-orders`,
                cancel_url: `${Constants.CLIENT_URL}/cancel`,
            })
            const order = await orderModel({
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
                    },
                    stripeSessionId: session.id
            })
            await order.save();
            return res.status(201).json({status: "success", message: "Order created successfully", data: order, checkoutURL: session.url})
        }


    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: "failed", message: "Internal Server Error", error: error.message })
    }
}

const changeStatusByAdmin = async (req, res) => {
    try {
        let { status, orderId } = req.body;
        if (!status) {
            return res.status(400).json({ status: "failed", message: "All fields required" })
        }
        let order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        // product.status = status
        await order.save();
        res.status(200).json({ status: "success", message: "Status Change Successfully", data: order })

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: "Internal Server Error" })
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
        res.status(500).json({ status: "failed", message: "Internal Server Error" })
    }
}

export { createOrder, changeStatusByAdmin, getOrders }
