import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
// @ts-ignore
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const prisma = new PrismaClient();
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

// @ts-ignore
export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        // Send message to SQS
        const command = new SendMessageCommand({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({ action: 'USER_REGISTERED', userId: user.id }),
        });

        await sqsClient.send(command);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @ts-ignore
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create and sign JWT
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET!,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @ts-ignore
export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.body.user.id },
            select: { id: true, username: true, email: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ... other controller functions remain the same