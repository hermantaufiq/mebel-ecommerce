import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" } },
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}
