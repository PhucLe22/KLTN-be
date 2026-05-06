import { prisma } from '../lib/prisma.js';

async function updatePreparationTime() {
  try {
    // Update all products without preparationTime to have a default value
    const result = await prisma.product.updateMany({
      where: {
        preparationTime: null
      },
      data: {
        preparationTime: 15 // Default 15 minutes
      }
    });

    console.log(`Updated ${result.count} products with default preparation time`);
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePreparationTime();
