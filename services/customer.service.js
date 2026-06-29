import { customerRepository } from "../repositories/customer.repository.js";

class CustomerService {
  async search(query) {
    return await customerRepository.search(query);
  }
}

export const customerService = new CustomerService();
