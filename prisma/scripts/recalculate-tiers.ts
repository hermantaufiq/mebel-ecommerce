import { PrismaClient } from "@prisma/client";
import { calculateTier } from "../../src/lib/server/tier-config";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Recalculating tiers and loyalty points for all users...");

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true }
  });

  let processed = 0;
  for (const user of users) {
    // Sum total from Selesai orders only (excluding any pending/cancelled)
    const completedOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: "Selesai"
      },
      select: { id: true, total: true, loyaltyProcessed: true }
    });

    const totalSpending = completedOrders.reduce((sum, o) => sum + o.total, 0);
    // Recalculate loyalty points: 1 point per Rp 100,000 from completed orders
    const loyaltyPoints = Math.floor(totalSpending / 100_000);
    const tier = calculateTier(totalSpending);

    await prisma.user.update({
      where: { id: user.id },
      data: { totalSpending, loyaltyPoints, tier }
    });

    // Mark all completed orders as loyaltyProcessed to prevent double counting
    const unprocessedIds = completedOrders
      .filter(o => !o.loyaltyProcessed)
      .map(o => o.id);
    if (unprocessedIds.length > 0) {
      await prisma.order.updateMany({
        where: { id: { in: unprocessedIds } },
        data: { loyaltyProcessed: true }
      });
    }

    console.log(`✓ ${user.name} (${user.email}): totalSpending=Rp${totalSpending.toLocaleString("id-ID")}, tier=${tier}, pts=${loyaltyPoints}`);
    processed++;
  }

  console.log(`\n✨ Done. Recalculated ${processed} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
