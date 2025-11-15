import { NextResponse } from "next/server";
import connectDB from "../../../lib/connectdb";
import Product from "../../../models/cloth";
import HistoryModel from "../../../models/history";
// =============================
// POST - Create a new history (checkout)
// =============================
export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { items, discount = 0, finalTotal } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Total amount of all items
    const totalItemsAmount = items.reduce(
      (sum, i) => sum + (i.sellingPrice || 0) * (i.quantity || 0),
      0
    );

    // Map items and calculate totalAmount & profit
    const itemsWithProfit = items.map((item) => {
      const qty = item.quantity || 0;
      const sp = item.sellingPrice || 0;
      const cp = item.costPrice || 0; // product cost price

      // proportional discount per item
      const itemDiscount =
        totalItemsAmount > 0 ? (sp * qty / totalItemsAmount) * discount : 0;

      const totalAmount = sp * qty - itemDiscount;
      const profit = totalAmount - cp * qty;

      return {
        productId: item.productId, // ✅ reference Product
        name: item.name,
        quantity: qty,
        sellingPrice: sp,
        totalAmount,
        profit: profit < 0 ? 0 : profit,
      };
    });

    // Save history
    const history = await HistoryModel.create({
      items: itemsWithProfit,
      discount,
      finalTotal,
    });

    // Decrease product stock
    for (const item of itemsWithProfit) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
    }

    return NextResponse.json(history, { status: 201 });
  } catch (err) {
    console.error("POST /history error:", err);
    return NextResponse.json(
      { error: "Failed to create history entry" },
      { status: 500 }
    );
  }
}

// =============================
// GET - Get all history entries
// =============================
// =============================
// GET - Get all history entries
// =============================


export async function GET() {
  await connectDB();
  try {
    // Use .lean() to get plain JS objects
    const history = await HistoryModel.find()
      .populate("items.productId", "sku name brandName costPrice sellingPrice")
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

      console.log(history)

    // Debug: full JSON in console
    console.log(JSON.stringify(history, null, 2));

    // Map to the desired structure
    const historyData = history.map(h => ({
      id: h._id.toString(),
      items: h.items.map(item => ({
        id: item._id.toString(),
        productId: item.productId?._id.toString() || null,
        sku: item.productId?.sku || null,
        name: item.name,
        brandName: item.productId?.brandName || null,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        totalAmount: item.totalAmount,
        profit: item.profit,
      })),
      discount: h.discount,
      finalTotal: h.finalTotal,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    }));

    return NextResponse.json(historyData, { status: 200 });
  } catch (err) {
    console.error("GET /history error:", err);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}




// =============================
// DELETE - Delete history entries
// =============================
export async function DELETE(req) {
  await connectDB();
  try {
    const { ids } = await req.json(); // expects multiple IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs are required" }, { status: 400 });
    }

    const deleted = await HistoryModel.deleteMany({ _id: { $in: ids } });

    if (deleted.deletedCount === 0) {
      return NextResponse.json({ error: "No history found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Deleted successfully", count: deleted.deletedCount },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /history error:", err);
    return NextResponse.json(
      { error: "Failed to delete history" },
      { status: 500 }
    );
  }
}
