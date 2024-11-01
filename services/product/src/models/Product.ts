export interface Product {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    price: number;
    sku: string;
    inventory: number;
    categoryId: number;
}

export interface Category {
    id: number;
    name: string;
}