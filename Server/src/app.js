import express from 'express';
import connectDB from './db/connect_db.js';
import Constants from './constant.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import bodyParser from 'body-parser';
import { stripeWebhook } from './controllers/order.controller.js';
import cors from 'cors'

const app = express();

app.post(
        "/order/api/webhook",
        bodyParser.raw({ type: "application/json" }),
        stripeWebhook
    );

connectDB(Constants.DB_URI);   
app.use(cors({
      origin: "https://codemart.netlify.app",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
app.use(express.json());
app.use('/user/api', userRoutes);
app.use('/product/api', productRoutes);
app.use('/category/api', categoryRoutes);
app.use('/order/api', orderRoutes);
app.use('/rating/api', ratingRoutes);

app.get('/', (req, res) => {
    res.send("Hello World!");
})

const PORT = process.env.PORT || Constants.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server runnning on http://localhost:${PORT}`);
})
