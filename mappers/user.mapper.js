import { getUsersSchema as outputGetUsersSchema, updateUserSchema as outputUpdateUserSchema, deleteUserSchema as outputDeleteUserSchema } from "../contracts/output/user.output.schema.js";

export class UserMapper {
  static toGetAllUsersResponse(items) {
    return items.map(item => outputGetUsersSchema.response.parse(item));
  }

  static toUpdateUserResponse(data) {
    return outputUpdateUserSchema.response.parse(data);
  }

  static toDeleteUserResponse() {
    return outputDeleteUserSchema.response.parse({ message: "User deleted successfully" });
  }
}
