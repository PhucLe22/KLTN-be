import pkg from "@prisma/client/index-browser.js";
import { UserType } from "../constants/enum.js";
import {
  registerOutputSchema,
  guestOutputSchema,
  loginOutputSchema,
  profileOutputSchema,
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
      return builder.asStaff(user.staff, user.email || user.phone).build();
    }

    if (user.customer) {
      return builder.asCustomer(user.customer).build();
    }

    return builder.build();
  }

  static toProfileResponse(user) {
    const data = {
      type: "CUSTOMER",
    };

    if (user.customer) {
      data.type = "CUSTOMER";
      data.customer = {
        name: user.customer.name,
        phone: user.customer.phone,
        email: user.customer.email,
        tier: user.customer.tier,
        points: user.customer.points,
      };
    } else if (user.staff) {
      const role = user.staff.role;

      if (role === "MANAGER") {
        data.type = "MANAGER";
        data.manager = {
          storeInfo: {
            id: user.staff.store.id,
            name: user.staff.store.name,
            address: user.staff.store.address,
          },
          userInfo: {
            email: user.email,
            phone: user.phone,
            name: user.email || user.phone || "Manager",
            role: user.staff.role,
          },
        };
      } else if (role === "OWNER") {
        data.type = "ADMIN";
        data.admin = {
          userInfo: {
            email: user.email,
            phone: user.phone,
            name: user.email || user.phone || "Admin",
            role: user.staff.role,
          },
        };
      } else {
        data.type = "STAFF";
        data.staff = {
          storeInfo: {
            id: user.staff.store.id,
            name: user.staff.store.name,
            address: user.staff.store.address,
          },
          userInfo: {
            email: user.email,
            phone: user.phone,
            name: user.email || user.phone || "Staff",
            role: user.staff.role,
          },
          managerInfo: {
            id: user.staff.store.id,
            name: "Store Manager",
            email: "manager@foodapp.com",
            phone: "0901234567",
          },
        };
      }
    }

    return profileOutputSchema.parse(data);
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

  asStaff(staffData, email) {
    this.result.name = email;
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
