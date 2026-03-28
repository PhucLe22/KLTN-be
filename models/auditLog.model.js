import { defineEntity } from "./_entity.js";

export const AuditLogEntity = defineEntity("AuditLog", {
  select: {
    id: true,
    entity: true,
    entityId: true,
    action: true,
    oldData: true,
    newData: true,
    createdBy: true,
    createdAt: true,
  },
});

