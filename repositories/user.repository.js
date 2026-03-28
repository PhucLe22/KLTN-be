import { BaseRepository } from './base.repository.js';

export class UserRepository extends BaseRepository {
  constructor(prismaUser) {
    super(prismaUser);
  }

  async findByCredentials(email, phone) {
    return await this.model.findFirst({
      where: {
        OR: [
          email ? { email } : null,
          phone ? { phone } : null
        ].filter(Boolean)
      },
      include: { customer: true }
    });
  }
}

