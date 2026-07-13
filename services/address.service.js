import { addressRepository } from "../repositories/address.repository.js";
import { geocodeAddress } from "../lib/geocoding.js";
import { prisma } from "../lib/prisma.js";
import axios from "axios";

class AddressService {
  async create(data) {
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

  async autocomplete(text, { type, limit = 5, lang } = {}) {
    const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("GEOAPIFY_API_KEY is not defined");
    }

    const params = {
      text,
      format: "json",
      filter: "countrycode:vn",
      limit,
      apiKey,
    };
    if (type) params.type = type;
    if (lang) params.lang = lang;

    const response = await axios.get(
      "https://api.geoapify.com/v1/geocode/autocomplete",
      { params }
    );

    const results = response.data?.results || [];
    return results.map((r) => ({
      formatted: r.formatted,
      address_line1: r.address_line1,
      address_line2: r.address_line2,
      street: r.street,
      housenumber: r.housenumber,
      city: r.city,
      state: r.state,
      postcode: r.postcode,
      country: r.country,
      lat: r.lat,
      lon: r.lon,
      result_type: r.result_type,
      rank: r.rank,
    }));
  }
}

export const addressService = new AddressService();
