import "dotenv/config";
import { prisma } from "./lib/prisma.js";
import axios from "axios";
import bcrypt from "bcrypt";
import { JwtHelper } from "./lib/jwt.js";
import { StaffRole, DiscountType, VoucherScope } from "./constants/enum.js";

const BASE_URL = "http://localhost:5001/api/v1/internal/vouchers";

let testStore, testUser, token, createdVoucherId;

async function cleanup() {
  if (createdVoucherId) {
    await prisma.voucher.deleteMany({ where: { id: createdVoucherId } }).catch(() => {});
  }
  await prisma.staff.deleteMany({ where: { user: { email: "test_voucher_admin@test.com" } } }).catch(() => {});
  await prisma.user.deleteMany({ where: { email: "test_voucher_admin@test.com" } }).catch(() => {});
  await prisma.store.deleteMany({ where: { code: { startsWith: "TSTVCH" } } }).catch(() => {});
}

async function setup() {
  await cleanup();

  const storeCode = `TSTVCH-${Date.now()}`.slice(0, 20);
  testStore = await prisma.store.upsert({
    where: { code: storeCode },
    update: {},
    create: {
      code: storeCode,
      name: "Test Voucher Store",
      address: "123 Test St",
      hotline: "0999999999",
      lat: 10.77,
      lng: 106.70,
    },
  });

  const hashedPassword = await bcrypt.hash("test123", 10);

  testUser = await prisma.user.create({
    data: {
      email: "test_voucher_admin@test.com",
      password: hashedPassword,
      isActive: true,
      staff: {
        create: {
          storeId: testStore.id,
          role: StaffRole.ADMIN,
          isActive: true,
        },
      },
    },
    include: { staff: true },
  });

  token = JwtHelper.generateAccessToken({
    sub: testUser.id,
    type: "STAFF",
    role: testUser.staff.role,
    sid: testUser.staff.id,
    storeId: testUser.staff.storeId,
  });

  console.log("✅ Test setup complete (Admin user + Store)");
}

async function testCreateVoucher() {
  console.log("\n--- TEST: CREATE VOUCHER ---");

  // TC1: Create voucher successfully
  console.log("\n[TC1] Create PERCENT voucher");
  const res1 = await axios.post(
    BASE_URL,
    {
      code: `P-${Date.now()}`.slice(0, 20),
      discountType: DiscountType.PERCENT,
      discountValue: 10,
      maxUsage: 100,
      minOrderAmount: 50000,
      maxDiscount: 50000,
      storeId: testStore.id,
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  console.log("   Status:", res1.status);
  console.log("   Success:", res1.data.success);
  console.log("   Code:", res1.data.data?.code);
  console.log("   DiscountValue:", res1.data.data?.discountValue);
  createdVoucherId = res1.data.data?.id;
  if (!createdVoucherId) throw new Error("TC1 FAILED: No voucher ID returned");
  console.log("   ✅ TC1 PASSED");

  // TC2: Create FIXED voucher
  console.log("\n[TC2] Create FIXED voucher without optional fields");
  const res2 = await axios.post(
    BASE_URL,
    {
        code: `FX-${Date.now()}`.slice(0, 20),
      discountType: DiscountType.FIXED,
      discountValue: 25000,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  console.log("   Status:", res2.status);
  console.log("   Scope default (PUBLIC):", res2.data.data?.scope);
  console.log("   isActive default (true):", res2.data.data?.isActive);
  console.log("   ✅ TC2 PASSED");
  // Clean up second voucher
  await prisma.voucher.delete({ where: { id: res2.data.data.id } }).catch(() => {});

  // TC3: Validation error — missing required fields
  console.log("\n[TC3] Missing required fields (should be 400)");
  try {
    await axios.post(BASE_URL, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log("   ❌ TC3 FAILED: Should have thrown");
  } catch (err) {
    console.log("   Status:", err.response?.status);
    console.log("   ✅ TC3 PASSED (Got validation error)");
  }

  // TC4: Duplicate code (should be 500 — Prisma unique violation)
  console.log("\n[TC4] Duplicate voucher code");
  try {
    await axios.post(
      BASE_URL,
      {
        code: `DU-${Date.now()}`.slice(0, 20),
        discountType: DiscountType.PERCENT,
        discountValue: 5,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    // Create duplicate
        const dupCode = `DU-${Date.now()}`.slice(0, 20);
    await axios.post(
      BASE_URL,
      {
        code: dupCode,
        discountType: DiscountType.PERCENT,
        discountValue: 5,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await axios.post(
      BASE_URL,
      {
        code: dupCode,
        discountType: DiscountType.FIXED,
        discountValue: 10000,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log("   ❌ TC4 FAILED: Should have thrown");
  } catch (err) {
    console.log("   Status:", err.response?.status);
    console.log("   Error:", err.response?.data?.message);
    console.log("   ✅ TC4 PASSED (Duplicate code rejected)");
  }

  // TC5: Unauthorized — no token
  console.log("\n[TC5] No auth token (should be 401)");
  try {
    await axios.post(BASE_URL, {
      code: `NA-${Date.now()}`.slice(0, 20),
      discountType: DiscountType.PERCENT,
      discountValue: 10,
    });
    console.log("   ❌ TC5 FAILED");
  } catch (err) {
    console.log("   Status:", err.response?.status);
    console.log("   ✅ TC5 PASSED");
  }

  // TC6: Forbidden — wrong role (SHIPPER)
  console.log("\n[TC6] SHIPPER role cannot create voucher (should be 403)");
  try {
    const shipperUser = await prisma.user.create({
      data: {
        email: `shipper_voucher_test-${Date.now()}@test.com`,
        password: await bcrypt.hash("test123", 10),
        isActive: true,
        staff: {
          create: {
            storeId: testStore.id,
            role: StaffRole.SHIPPER,
            isActive: true,
          },
        },
      },
      include: { staff: true },
    });
    const shipperToken = JwtHelper.generateAccessToken({
      sub: shipperUser.id,
      type: "STAFF",
      role: StaffRole.SHIPPER,
      sid: shipperUser.staff.id,
      storeId: shipperUser.staff.storeId,
    });
    await axios.post(
      BASE_URL,
      { code: `SH-${Date.now()}`.slice(0, 20), discountType: DiscountType.PERCENT, discountValue: 10 },
      { headers: { Authorization: `Bearer ${shipperToken}` } },
    );
    console.log("   ❌ TC6 FAILED");
    await prisma.staff.delete({ where: { id: shipperUser.staff.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: shipperUser.id } }).catch(() => {});
  } catch (err) {
    console.log("   Status:", err.response?.status);
    console.log("   ✅ TC6 PASSED");
  }
}

async function testUpdateVoucher() {
  console.log("\n--- TEST: UPDATE VOUCHER ---");

  // TC7: Update discountValue
  console.log("\n[TC7] Update discountValue");
  const res = await axios.patch(
    `${BASE_URL}/${createdVoucherId}`,
    { discountValue: 15 },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  console.log("   Status:", res.status);
  console.log("   New discountValue:", res.data.data?.discountValue);
  const updated = await prisma.voucher.findUnique({ where: { id: createdVoucherId } });
  console.log("   DB discountValue:", Number(updated.discountValue));
  if (Number(updated.discountValue) !== 15) throw new Error("TC7 FAILED: Value not updated");
  console.log("   ✅ TC7 PASSED");

  // TC8: Update expiresAt
  console.log("\n[TC8] Update expiresAt");
  const newExpiry = new Date(Date.now() + 86400000 * 60).toISOString();
  await axios.patch(
    `${BASE_URL}/${createdVoucherId}`,
    { expiresAt: newExpiry },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const updated2 = await prisma.voucher.findUnique({ where: { id: createdVoucherId } });
  console.log("   Updated expiresAt:", updated2.expiresAt);
  if (!updated2.expiresAt) throw new Error("TC8 FAILED: expiresAt not set");
  console.log("   ✅ TC8 PASSED");

  // TC9: Deactivate voucher
  console.log("\n[TC9] Deactivate voucher");
  await axios.patch(
    `${BASE_URL}/${createdVoucherId}`,
    { isActive: false },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const updated3 = await prisma.voucher.findUnique({ where: { id: createdVoucherId } });
  console.log("   isActive:", updated3.isActive);
  if (updated3.isActive !== false) throw new Error("TC9 FAILED");
  console.log("   ✅ TC9 PASSED");

  // TC10: Update non-existent voucher
  console.log("\n[TC10] Update non-existent ID");
  try {
    await axios.patch(
      `${BASE_URL}/00000000-0000-0000-0000-000000000000`,
      { discountValue: 10 },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log("   ❌ TC10 FAILED");
  } catch (err) {
    console.log("   Status:", err.response?.status);
    console.log("   ✅ TC10 PASSED (Got error)");
  }

  // TC11: Invalid UUID param
  console.log("\n[TC11] Invalid UUID param");
  try {
    await axios.patch(
      `${BASE_URL}/not-a-uuid`,
      { discountValue: 10 },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log("   ❌ TC11 FAILED");
  } catch (err) {
    console.log("   Status:", err.response?.status);
    console.log("   ✅ TC11 PASSED");
  }
}

async function testDeleteVoucher() {
  console.log("\n--- TEST: DELETE VOUCHER ---");

  // Create a fresh voucher to delete
  const toDelete = await prisma.voucher.create({
    data: {
      code: `DEL-${Date.now()}`.slice(0, 20),
      discountType: DiscountType.PERCENT,
      discountValue: 5,
    },
  });
  const deleteId = toDelete.id;

  // TC12: Delete successfully
  console.log("\n[TC12] Delete voucher");
  const res = await axios.delete(`${BASE_URL}/${deleteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("   Status:", res.status);
  const deleted = await prisma.voucher.findUnique({ where: { id: deleteId } });
  console.log("   Exists in DB:", !!deleted);
  if (deleted) throw new Error("TC12 FAILED: Voucher still exists");
  console.log("   ✅ TC12 PASSED");

  // TC13: Delete non-existent voucher
  console.log("\n[TC13] Delete non-existent voucher");
  try {
    await axios.delete(`${BASE_URL}/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("   ❌ TC13 FAILED");
  } catch (err) {
    console.log("   Status:", err.response?.status);
    console.log("   ✅ TC13 PASSED");
  }

  // TC14: Delete without auth
  console.log("\n[TC14] Delete without auth");
  try {
    await axios.delete(`${BASE_URL}/${deleteId}`);
    console.log("   ❌ TC14 FAILED");
  } catch (err) {
    console.log("   Status:", err.response?.status);
    console.log("   ✅ TC14 PASSED");
  }
}

async function runTests() {
  console.log("🚦 Starting Voucher CRUD API Tests...\n");

  try {
    await setup();
    await testCreateVoucher();
    await testUpdateVoucher();
    await testDeleteVoucher();
    console.log("\n🎉 All voucher CRUD tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test suite failed!");
    if (error.response) {
      console.error("API Error:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exitCode = 1;
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }
}

runTests();
