import { categoryRepository } from "../repositories/category.repository.js";
import { prisma } from "../lib/prisma.js";
import {  createSlug } from "../lib/helpers.js";

class CategoryService {

    async findAll(query) {
        return await categoryRepository.findAll(query);
    }
    async findBySlug(slug) {
        return await categoryRepository.findBySlug(slug);
    }

    async create(data) {
        // Use provided slug, generate from name only if not provided
        const categoryData = {
            ...data,
            slug: await createSlug(prisma.category, data.name)
        };
        
        return await categoryRepository.create(categoryData);
    }



    async update(id, data) {
        //if update name then update slug
        return await categoryRepository.update(id, data);
    }

    async delete(id) {
        return await categoryRepository.update(id, { isActive: false });
    }
}

export const categoryService = new CategoryService();
