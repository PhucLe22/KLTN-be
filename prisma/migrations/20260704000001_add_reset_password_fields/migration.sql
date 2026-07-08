-- AlterTable
ALTER TABLE "iam"."User" ADD COLUMN "resetPasswordToken" TEXT,
ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "iam"."User"("resetPasswordToken");
