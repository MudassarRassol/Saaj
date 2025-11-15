"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Date filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Fetch history
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/history");
      console.log(res)
      setHistory(res.data || []); // API returns array directly
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ✅ Toggle single select
  const toggleSelect = (id) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Delete single
  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await axios.delete("/api/update-history", { data: { ids: [id] } });
      setHistory((prev) => prev.filter((record) => record._id !== id));
      setSelectedRecords((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ✅ Delete multiple
  const handleDeleteSelected = async () => {
    if (selectedRecords.length === 0) return;
    if (!confirm("Delete selected records?")) return;

    try {
      await axios.delete("/api/update-history", { data: { ids: selectedRecords } });
      setHistory((prev) =>
        prev.filter((record) => !selectedRecords.includes(record._id))
      );
      setSelectedRecords([]);
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  // ✅ Filter history
  const filteredHistory = history
    .filter((record) =>
      record.items.some((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    )
    .filter((record) => {
      if (!startDate && !endDate) return true;
      const recordDate = new Date(record.createdAt).setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      if (start && recordDate < start) return false;
      if (end && recordDate > end) return false;
      return true;
    });

  // ✅ Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingItem) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredHistory.length - 1 ? prev + 1 : prev
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const current = filteredHistory[focusedIndex];
        if (current) toggleSelect(current._id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredHistory, focusedIndex, editingItem]);

  // ✅ Open modal
  const openEditModal = (record, item) => {
    setEditingRecord(record);
    setEditingItem(item);
    setNewQuantity(item.quantity);
  };

  // ✅ Update quantity
  const handleUpdateQuantity = async () => {
    if (!editingRecord || !editingItem) return;
     console.log(editingRecord.id,editingItem.id,newQuantity)
    try {
      await axios.put("/api/update-quntity", {
        historyId: editingRecord.id,
        itemId: editingItem.id,
        newQuantity: newQuantity,
      });

      const updatedItems = editingRecord.items.map((item) =>
        item._id === editingItem._id
          ? {
              ...item,
              quantity: newQuantity,
              totalAmount: newQuantity * item.sellingPrice,
              profit:
                (item.sellingPrice - (item.profit / item.quantity || 0)) *
                newQuantity,
            }
          : item
      );
      const updatedFinalTotal = updatedItems.reduce(
        (sum, i) => sum + i.totalAmount,
        0
      );

      setHistory((prev) =>
        prev.map((record) =>
          record._id === editingRecord._id
            ? { ...record, items: updatedItems, finalTotal: updatedFinalTotal }
            : record
        )
      );

      setEditingItem(null);
      setEditingRecord(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // ✅ Total Quantity Sold
  const totalQuantity = filteredHistory.reduce((sum, record) => {
    return (
      sum +
      record.items.reduce(
        (itemSum, item) => itemSum + Number(item.quantity || 0),
        0
      )
    );
  }, 0);

  // ✅ Total Sales (Revenue)
  const totalSales = filteredHistory.reduce(
    (sum, record) => sum + record.finalTotal,
    0
  );

  // ✅ Total Profit
  const totalProfit = filteredHistory.reduce((sum, record) => {
    return (
      sum +
      record.items.reduce((itemSum, item) => itemSum + Number(item.profit || 0), 0)
    );
  }, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-600 mt-2">Track all clothing sales and orders</p>
      </div>

      {/* 🔹 Search + Date Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          placeholder="Search by product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
        />
        {selectedRecords.length > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected ({selectedRecords.length})
          </Button>
        )}
      </div>

      {/* 🔹 Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <Table>
          <TableHeader className="bg-gray-100 border-b border-gray-200">
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>No</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price/Unit (₨)</TableHead>
              <TableHead className="text-right">Total (₨)</TableHead>
              <TableHead className="text-right">Discount (₨)</TableHead>
              <TableHead className="text-right">Final Total (₨)</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Profit (₨)</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-8">
                  <span className="text-gray-500">Loading...</span>
                </TableCell>
              </TableRow>
            ) : filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-8">
                  <span className="text-gray-500">No sales records found</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.flatMap((record, idx) =>
                record.items.map((item, itemIdx) => (
                  <TableRow
                    key={`${record._id}-${itemIdx}`}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      selectedRecords.includes(record._id) ? "bg-blue-50" : ""
                    }`}
                  >
                    {itemIdx === 0 && (
                      <>
                        <TableCell rowSpan={record.items.length}>
                          <input
                            type="checkbox"
                            checked={selectedRecords.includes(record._id)}
                            onChange={() => toggleSelect(record._id)}
                          />
                        </TableCell>
                        <TableCell rowSpan={record.items.length}>{idx + 1}</TableCell>
                      </>
                    )}
                    <TableCell>{item.sku || "-"}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.brandName || "-"}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₨ {item.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₨ {item.totalAmount.toFixed(2)}</TableCell>
                    {itemIdx === 0 && (
                      <>
                        <TableCell rowSpan={record.items.length} className="text-right">
                          ₨ {record.discount.toFixed(2)}
                        </TableCell>
                        <TableCell rowSpan={record.items.length} className="text-right font-semibold">
                          ₨ {record.finalTotal.toFixed(2)}
                        </TableCell>
                        <TableCell rowSpan={record.items.length}>
                          {new Date(record.createdAt).toLocaleDateString()}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-right text-green-600 font-medium">
                      ₨ {item.profit.toFixed(2)}
                    </TableCell>
                    {itemIdx === 0 && (
                      <TableCell rowSpan={record.items.length} className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditModal(record, item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(record._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )
            )}

            {/* 🔹 Summary Row */}
            {filteredHistory.length > 0 && (
              <TableRow className="bg-gray-100 font-bold border-t-2 border-gray-300">
                <TableCell colSpan={5} className="text-right">Total Quantity: {totalQuantity}</TableCell>
                <TableCell colSpan={2} className="text-right">Total Sales: ₨ {totalSales.toFixed(2)}</TableCell>
                <TableCell colSpan={5} className="text-right text-green-600">Total Profit: ₨ {totalProfit.toFixed(2)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Quantity Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quantity</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-gray-700"><strong>Product:</strong> {editingItem?.name}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Quantity
              </label>
              <Input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button onClick={handleUpdateQuantity}>Update Quantity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
