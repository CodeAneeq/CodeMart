import express from 'express';
import connectDB from './db/connect_db.js';
import Constants from './constant.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import cors from 'cors'

const app = express();

connectDB(Constants.DB_URI);
app.use(express.json());
app.use(cors())
app.use('/user/api', userRoutes);
app.use('/product/api', productRoutes);
app.use('/category/api', categoryRoutes);
app.use('/order/api', orderRoutes);
app.use('/rating/api', ratingRoutes);

app.get('/', (req, res) => {
    res.send("Hello World!");
})

const PORT = Constants.PORT;
app.listen(PORT, () => {
    console.log(`server runnning on http://localhost:${PORT}`);
})