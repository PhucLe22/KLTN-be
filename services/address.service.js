import { addressRepository } from "../repositories/address.repository.js";
import { geocodeAddress } from "../lib/geocoding.js";
import { prisma } from "../lib/prisma.js";

class AddressService {
  async create(data) {
    const { lat, lng } = await geocodeAddress(data.addressLine);
    
    return await prisma.$transaction(async (tx) => {
      if (data.isDefault && data.customerId) {
        await addressRepository.clearDefault(data.customerId, tx);
      }
      
      return await addressRepository.create({
        ...data,
        lat,
        lng
      }, tx);
    });
  }

  async update(id, data) {
    let geocodeData = {};
    if (data.addressLine) {
      const { lat, lng } = await geocodeAddress(data.addressLine);
      geocodeData = { lat, lng };
    }

    return await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        const address = await addressRepository.findById(id);
        if (address && address.customerId) {
          await addressRepository.clearDefault(address.customerId, tx);
        }
      }

      return await addressRepository.update(id, {
        ...data,
        ...geocodeData
      }, tx);
    });
  }

  async setDefault(id) {
    const address = await addressRepository.findById(id);
    if (!address) throw new Error("Address not found");
    if (!address.customerId) throw new Error("Address is not associated with a customer");

    return await prisma.$transaction(async (tx) => {
      await addressRepository.clearDefault(address.customerId, tx);
      return await addressRepository.update(id, { isDefault: true }, tx);
    });
  }

  async findByCustomer(customerId) {
    return await addressRepository.findAll({
      where: { customerId },
      orderBy: { isDefault: "desc", createdAt: "desc" }
    });
  }

  async findByStore(storeId) {
    return await addressRepository.findAll({
      where: { storeId },
      orderBy: { createdAt: "desc" }
    });
  }

  async delete(id) {
    return await addressRepository.delete(id);
  }
}

export const addressService = new AddressService();
