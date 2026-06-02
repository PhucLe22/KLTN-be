import { BaseRepository } from "./base.repository.js";

class StaffRepository extends BaseRepository {
  constructor() {
    super("staff");
  }

  //Lấy danh sách nhân viên của một chi nhánh cụ thể
  async findByStore(storeId, tx = null) {
    return await this.getModel(tx).findMany({
      where: {
        storeId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findWithUser(staffId, tx = null) {
    return await this.getModel(tx).findUnique({
      where: { id: staffId },
      include: { user: true },
    });
  }

  async findManagerByStore(storeId, tx = null) {
    return await this.getModel(tx).findFirst({
      where: {
        storeId,
        role: "MANAGER",
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }
}

export const staffRepository = new StaffRepository();
