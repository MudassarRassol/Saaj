import connectDB from "../../../lib/connectdb";
import Product from "../../../models/cloth";
import History from "../../../models/history";

export async function GET() {
  await connectDB();

  try {
    // ===========================
    //  TOTAL PRODUCTS COUNT
    // ===========================
    const totalProducts = await Product.countDocuments();

    // ===========================
    //  LOW STOCK (quantity <= 10)
    // ===========================
    const lowStock = await Product.countDocuments({
      quantity: { $lte: 10 },
    });

    // ===========================
    //  TOTAL INVENTORY VALUE (TP)
    //  SUM = quantity × costPrice
    // ===========================
    const allProducts = await Product.find({}, "quantity costPrice");

    const totalInventoryValue = allProducts.reduce((sum, p) => {
      return sum + (p.quantity || 0) * (p.costPrice || 0);
    }, 0);

    const roundedInventoryValue = Math.floor(totalInventoryValue);

    // ===========================
    //  TODAY SALES & PROFIT
    // ===========================
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySalesRecords = await History.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate("items.productId", "costPrice");

    // Total Sales = sum of finalTotal
    const todaySalesTotal = todaySalesRecords.reduce(
      (sum, r) => sum + (r.finalTotal || 0),
      0
    );

    // Profit = (sellingPrice - costPrice) × quantity
    const todayProfit = todaySalesRecords.reduce((sum, r) => {
      return (
        sum +
        r.items.reduce((itemProfit, item) => {
          const selling = Number(item.sellingPrice || 0);
          const cost = Number(item.productId?.costPrice || 0);
          const qty = Number(item.quantity || 0);
          return itemProfit + (selling - cost) * qty;
        }, 0)
      );
    }, 0);

    // Round values
    const roundedSales = Math.floor(todaySalesTotal);
    const roundedProfit = Math.floor(todayProfit);

    // ===========================
    //  SEND RESPONSE
    // ===========================
    return new Response(
      JSON.stringify({
        totalProducts,
        lowStock,
        todaySales: roundedSales,
        todayProfit: roundedProfit,
        totalInventoryValue: roundedInventoryValue,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Dashboard API Error:", err);

    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
