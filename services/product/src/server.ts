import express from 'express';
import productRoutes from './routes/product';

const app = express();

app.use(express.json());

app.use('/products', productRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Product service running on port ${PORT}`);
});