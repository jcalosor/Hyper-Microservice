export interface User {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    username: string;
    password: string;
    role: 'USER' | 'ADMIN';
}