import {
  AccountOutputSchema,
  GuestOutputSchema,
  LoginOutputSchema,
} from "../dtos/auth.dto.js";
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

    return AccountOutputSchema.parse(data);
  }

  /**
   * Dùng cho GUEST (Tạo nhanh tại quầy)
   */
  static toGuestResponse(customer) {
    const data = {
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      tier: customer.tier || "BRONZE",
    };

    return GuestOutputSchema.parse(data);
  }
  /**
   * Trả về thông tin User kèm Token sau Login
   *
   */
  // static toAccountWithTokensResponse(user, tokens) {
  //   const response = {
  //     accessToken: tokens.accessToken,
  //     refreshToken: tokens.refreshToken,
  //     id: user.id,
  //     email: user.email,
  //   };

  //   if (user.staff) {
  //     response.name = user.staff.name;
  //     response.role = user.staff.role;
  //     response.type = "STAFF";
  //     response.storeName = user.staff.store?.name || "N/A";
  //   } else if (user.customer) {
  //     response.name = user.customer.name;
  //     response.tier = user.customer.tier;
  //     response.points = user.customer.points;
  //     response.type = "CUSTOMER";
  //   }

  //   return LoginOutputSchema.parse(response);
  // }

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
    this.result.type = "STAFF";
    this.result.storeName = staffData.store?.name || "N/A";
    return this;
  }

  asCustomer(customerData) {
    this.result.name = customerData.name;
    this.result.tier = customerData.tier;
    this.result.points = customerData.points;
    this.result.type = "CUSTOMER";
    return this;
  }

  build() {
    return LoginOutputSchema.parse(this.result);
  }
}
