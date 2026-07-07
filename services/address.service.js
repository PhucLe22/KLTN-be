import { addressRepository } from "../repositories/address.repository.js";
import { geocodeAddress } from "../lib/geocoding.js";
import { prisma } from "../lib/prisma.js";

class AddressService {
  async create(data) {
    if (data.addressLine && (data.lat === undefined || data.lat === null || data.lng === undefined || data.lng === null)) {
      try {
        console.log(`[AddressService] Geocoding new address: ${data.addressLine}`);
        const result = await geocodeAddress(data.addressLine);
        if (result) {
          data.lat = result.lat;
          data.lng = result.lng;
          console.log(`[AddressService] Geocoding success: lat=${data.lat}, lng=${data.lng}`);
        }
      } catch (error) {
        console.error("Geocoding failed during address creation:", error.message);
      }
    }
    
    return await prisma.$transaction(async (tx) => {
      // Logic for intelligent isDefault
      if (data.customerId) {
        const existingCount = await tx.address.count({ where: { customerId: data.customerId } });
        
        if (existingCount === 0) {
          // First address is always default
          data.isDefault = true;
        } else if (data.isDefault) {
          // If explicitly set to default, clear previous defaults
          await addressRepository.clearDefault(data.customerId, tx);
        } else {
          // Otherwise, it's not default (force false if undefined)
          data.isDefault = false;
        }
      }
      
      return await addressRepository.create(data, tx);
    });
  }

  async update(id, data) {
    const existingAddress = await addressRepository.findById(id);
    if (!existingAddress) throw new Error("Address not found");

    // Only geocode if addressLine changed and coordinates are not provided
    const addressChanged = data.addressLine && data.addressLine !== existingAddress.addressLine;
    const coordsMissing = data.lat === undefined || data.lat === null || data.lng === undefined || data.lng === null;

    if (addressChanged && coordsMissing) {
      try {
        console.log(`[AddressService] Address changed from "${existingAddress.addressLine}" to "${data.addressLine}". Geocoding...`);
        const result = await geocodeAddress(data.addressLine);
        if (result) {
          data.lat = result.lat;
          data.lng = result.lng;
          console.log(`[AddressService] Geocoding success: lat=${data.lat}, lng=${data.lng}`);
        }
      } catch (error) {
        console.error("Geocoding failed during address update:", error.message);
      }
    }

    return await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        if (existingAddress.customerId) {
          await addressRepository.clearDefault(existingAddress.customerId, tx);
        }
      }

      return await addressRepository.update(id, data, tx);
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
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ]
    });
  }

  async findByStore(storeId) {
    return await addressRepository.findAll({
      where: { storeId },
      orderBy: [{ createdAt: "desc" }]
    });
  }

  async delete(id) {
    return await addressRepository.delete(id);
  }

  async findById(id) {
    return await addressRepository.findById(id);
  }
}

export const addressService = new AddressService();
