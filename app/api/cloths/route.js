import connectDB from "./../../../lib/connectdb.js";
import Product from "../../../models/cloth.js";
// =============================
//           GET
// =============================
export async function GET() {
  await connectDB();
  try {
    const products = await Product.find();
    return Response.json(products, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// =============================
//           POST
// =============================
export async function POST(req) {
  await connectDB();
  try {
    const {
      sku,
      name,
      category,
      fabricType,
      color,
      size,
      brandName,
      quantity,
      costPrice,
      sellingPrice,
    } = await req.json();

    const newProduct = await Product.create({
      sku,
      name,
      category,
      fabricType,
      color,
      size,
      brandName,
      quantity,
      costPrice,
      sellingPrice,
    });

    return Response.json(newProduct, { status: 200 });
  } catch (err) {
    console.error("❌ Error adding product:", err);
    return Response.json({ error: "Failed to add product" }, { status: 400 });
  }
}

// =============================
//           PUT
// =============================
export async function PUT(req) {
  await connectDB();
  try {
    const {
      id,
      sku,
      name,
      category,
      fabricType,
      color,
      size,
      brandName,
      quantity,
      costPrice,
      sellingPrice,
    } = await req.json();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        sku,
        name,
        category,
        fabricType,
        color,
        size,
        brandName,
        quantity,
        costPrice,
        sellingPrice,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(updatedProduct, { status: 200 });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    return Response.json({ error: "Failed to update product" }, { status: 400 });
  }
}

// =============================
//           DELETE
// =============================
export async function DELETE(req) {
  await connectDB();
  try {
    const { id, ids } = await req.json();

    // Bulk delete
    if (ids && Array.isArray(ids)) {
      await Product.deleteMany({ _id: { $in: ids } });
      return Response.json({ message: "Products deleted" }, { status: 200 });
    }

    // Single delete
    if (id) {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        return Response.json({ error: "Product not found" }, { status: 404 });
      }
      return Response.json({ message: "Product deleted" }, { status: 200 });
    }

    return Response.json({ error: "No ID(s) provided" }, { status: 400 });
  } catch (err) {
    console.error("❌ Delete error:", err);
    return Response.json({ error: "Failed to delete product" }, { status: 400 });
  }
}
