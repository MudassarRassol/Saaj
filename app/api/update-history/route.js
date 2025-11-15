import { NextResponse } from "next/server";
import connectDB from "../../../lib/connectdb";
import HistoryModel from "../../../models/history";

// =============================
// PUT - Update a history entry by ID
// =============================
export async function PUT(req) {
  await connectDB();
  try {
    console.log('run')
    const body = await req.json(); // get the body
    const { id, items, discount, finalTotal } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Map items to match schema if provided
    const itemsMapped = items?.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice,
      totalAmount: item.totalAmount,
      profit: item.profit,
    }));

    const updated = await HistoryModel.findByIdAndUpdate(
      id,
      {
        ...(itemsMapped && { items: itemsMapped }),
        discount,
        finalTotal,
      },
      {
        new: true, // return updated document
        runValidators: true,
      }
    );

    if (!updated) {
      return NextResponse.json({ error: "History not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /history error:", err);
    return NextResponse.json(
      { error: "Failed to update history" },
      { status: 500 }
    );
  }
}

// =============================
// DELETE - Delete a history entry by ID
// =============================
export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const body = await req.json();
    const id = params?.id || body?.id;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deleted = await HistoryModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "History not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /history error:", err);
    return NextResponse.json(
      { error: "Failed to delete history" },
      { status: 500 }
    );
  }
}
