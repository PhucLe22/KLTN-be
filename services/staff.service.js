import { staffRepository } from "../repositories/staff.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { prisma } from "../lib/prisma.js";
import { ERR } from "../lib/httpExceptions.js";

const STAFF_INCLUDE = {
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  store: {
    select: {
      name: true,
    },
  },
};

class StaffService {
  async findAll(query) {
    const { page = 1, limit = 10, role, search, storeId, sortBy = "createdAt", sortOrder = "desc" } = query;

    const where = {};

    if (role) {
      where.role = role;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    return await staffRepository.findAll({
      page,
      limit,
      where,
      include: STAFF_INCLUDE,
      orderBy: [{ [sortBy]: sortOrder }],
    });
  }

  async update(id, data) {
    const existing = await staffRepository.findById(id);
    if (!existing) {
      throw ERR.NotFound("Không tìm thấy nhân viên");
    }

    const { name, email, phone, password, role, storeId, isActive } = data;

    return await prisma.$transaction(async (tx) => {
      const userUpdate = {};
      if (name !== undefined) userUpdate.name = name;
      if (email !== undefined) userUpdate.email = email;
      if (phone !== undefined) userUpdate.phone = phone;
      if (password !== undefined) {
        userUpdate.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userUpdate).length > 0) {
        await userRepository.update(existing.userId, userUpdate, tx);
      }

      const staffUpdate = {};
      if (role !== undefined) staffUpdate.role = role;
      if (storeId !== undefined) staffUpdate.storeId = storeId;
      if (isActive !== undefined) staffUpdate.isActive = isActive;

      if (Object.keys(staffUpdate).length > 0) {
        await staffRepository.update(id, staffUpdate, tx);
      }

      return await staffRepository.findWithUser(id, tx);
    });
  }

  async remove(id) {
    const existing = await staffRepository.findById(id);
    if (!existing) {
      throw ERR.NotFound("Không tìm thấy nhân viên");
    }

    return await prisma.$transaction(async (tx) => {
      await userRepository.update(existing.userId, { isActive: false }, tx);
      await staffRepository.update(id, { isActive: false }, tx);
    });
  }

  async removeHard(id) {
    const existing = await staffRepository.findById(id);
    if (!existing) {
      throw ERR.NotFound("Không tìm thấy nhân viên");
    }

    return await prisma.$transaction(async (tx) => {
      await staffRepository.delete(id, tx);
      await userRepository.delete(existing.userId, tx);
    });
  }
}

export const staffService = new StaffService();
