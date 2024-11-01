import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const authServiceProxy = createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '',
    },
});

const productServiceProxy = createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/products': '',
    },
});

app.use('/auth', authServiceProxy);
app.use('/products', productServiceProxy);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});