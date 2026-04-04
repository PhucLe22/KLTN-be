import pkg from "@prisma/client/index-browser.js";
import { UserType } from "../constants/enum.js";
import {
  registerOutputSchema,
  guestOutputSchema,
  loginOutputSchema,
} from "../contracts/output/auth.output.schema.js";
const { CustomerTier } = pkg;

export class AuthMapper {
  /**
   * Dùng cho CUSTOMER và STAFF
   */
  static toAccountResponse(user) {
    const data = {
      id: user.id,
      email: user.email,
      phone: user.phone,
    };

    return registerOutputSchema.parse(data);
  }

  /**
   * Dùng cho GUEST (Tạo nhanh tại quầy)
   */
  static toGuestResponse(customer) {
    const data = {
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      tier: customer.tier || CustomerTier.BRONZE,
    };

    return guestOutputSchema.parse(data);
  }

  static toAccountWithTokensResponse(user, tokens) {
    const builder = new _LoginResponseBuilder(user, tokens);

    if (user.staff) {
      return builder.asStaff(user.staff).build();
    }

    if (user.customer) {
      return builder.asCustomer(user.customer).build();
    }

    return builder.build();
  }
}

class _LoginResponseBuilder {
  constructor(user, tokens) {
    // Khởi tạo các giá trị mặc định bắt buộc
    this.result = {
      accessToken: tokens.accessToken,
      // refreshToken: tokens.refreshToken,
      refreshToken: "protected",
      id: user.id,
      email: user.email,
    };
  }

  asStaff(staffData) {
    this.result.name = staffData.name;
    this.result.role = staffData.role;
    this.result.type = UserType.STAFF;
    this.result.storeName = staffData.store?.name || "N/A";
    return this;
  }

  asCustomer(customerData) {
    this.result.name = customerData.name;
    this.result.tier = customerData.tier;
    this.result.points = customerData.points;
    this.result.type = UserType.CUSTOMER;
    return this;
  }

  build() {
    return loginOutputSchema.parse(this.result);
  }
}
