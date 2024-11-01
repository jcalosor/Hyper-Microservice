import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        const category = await prisma.category.create({
            data: { name },
        });

        // Send message to SQS
        const command = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({ action: 'CATEGORY_CREATED', categoryId: category.id }),
        });

        await sqsClient.send(command);

        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllCategories = async (res: Response) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @ts-ignore
export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: { products: true },
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name },
        });

        // Send message to SQS
        const command = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({ action: 'CATEGORY_UPDATED', categoryId: updatedCategory.id }),
        });

        await sqsClient.send(command);

        res.json(updatedCategory);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.category.delete({
            where: { id: parseInt(id) },
        });

        // Send message to SQS
        const command = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({ action: 'CATEGORY_DELETED', categoryId: parseInt(id) }),
        });

        await sqsClient.send(command);

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};