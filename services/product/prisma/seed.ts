import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const electronics = await prisma.category.upsert({
        where: { name: 'Electronics' },
        update: {},
        create: { name: 'Electronics' },
    });

    const clothing = await prisma.category.upsert({
        where: { name: 'Clothing' },
        update: {},
        create: { name: 'Clothing' },
    });

    const laptop = await prisma.product.upsert({
        where: { sku: 'LAPTOP001' },
        update: {},
        create: {
            name: 'High-Performance Laptop',
            description: 'Powerful laptop for all your computing needs',
            price: 999.99,
            sku: 'LAPTOP001',
            inventory: 50,
            categoryId: electronics.id,
        },
    });

    const tshirt = await prisma.product.upsert({
        where: { sku: 'TSHIRT001' },
        update: {},
        create: {
            name: 'Cotton T-Shirt',
            description: 'Comfortable cotton t-shirt',
            price: 19.99,
            sku: 'TSHIRT001',
            inventory: 100,
            categoryId: clothing.id,
        },
    });

    console.log({ electronics, clothing, laptop, tshirt });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });