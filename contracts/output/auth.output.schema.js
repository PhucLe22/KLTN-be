import { UserType, StaffRole } from "../../constants/enum.js";
import { DEFAULT_NAMES, TOKEN_CONSTANTS } from "../../constants/errors.js";

export const AuthMap = {
  id: true,
  email: true,
  phone: true,
};

export const LoginMap = {
  id: 'user.id',
  name: (s) => s.user.customer?.name || s.user.email || s.user.phone,
  email: 'user.email',
  type: (s) => s.user.customer ? UserType.CUSTOMER : UserType.STAFF,
  
  // Customer
  tier: 'user.customer.tier',
  points: 'user.customer.points',

  // Staff
  role: 'user.staff.role',
  storeName: 'user.staff.store.name',

  // Tokens
  accessToken: (s, ctx) => ctx.tokens.accessToken,
  refreshToken: () => TOKEN_CONSTANTS.PROTECTED_REFRESH_TOKEN,
};

export const GuestMap = {
  customerId: 'id',
  name: true,
  phone: true,
  tier: (s) => s.tier || "BRONZE",
};

export const ProfileMap = {
  // Common
  name: (s) => s.customer?.name || s.email || s.phone || (s.staff ? DEFAULT_NAMES.STAFF : ""),
  email: (s) => s.customer?.email || s.email,
  phone: (s) => s.customer?.phone || s.phone,

  // Customer fields
  tier: 'customer.tier',
  points: 'customer.points',

  // Staff / Admin fields
  storeInfo: {
    $from: 'staff.store',
    id: true,
    name: true,
    address: true,
  },
  userInfo: (s) => ({
    email: s.email,
    phone: s.phone,
    name: s.email || s.phone || (s.staff?.role === StaffRole.MANAGER ? DEFAULT_NAMES.MANAGER : DEFAULT_NAMES.STAFF),
    role: s.staff?.role,
  }),
  managerInfo: (s) => s.staff?.manager ? {
    id: s.staff.manager.id,
    name: s.staff.manager.user.email || s.staff.manager.user.phone || DEFAULT_NAMES.MANAGER,
    email: s.staff.manager.user.email,
    phone: s.staff.manager.user.phone,
  } : null,
};
