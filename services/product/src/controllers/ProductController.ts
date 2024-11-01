import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const prisma = new PrismaClient();
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });


export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price } = req.body;

        // @ts-ignore
        const product = await prisma.product.create({
            // @ts-ignore
            data: {
                name,
                description,
                price: parseFloat(price),
            },
        });

        // Send message to SQS
        const command = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({ action: 'PRODUCT_CREATED', productId: product.id }),
        });

        await sqsClient.send(command);

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @ts-ignore
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: parseFloat(price),
            },
        });

        // Send message to SQS
        const command = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({ action: 'PRODUCT_UPDATED', productId: updatedProduct.id }),
        });

        await sqsClient.send(command);

        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.product.delete({
            where: { id: parseInt(id) },
        });

        // Send message to SQS
        const command = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({ action: 'PRODUCT_DELETED', productId: parseInt(id) }),
        });

        await sqsClient.send(command);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};