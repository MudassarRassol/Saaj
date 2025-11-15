"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Input } from "../../../../components/ui/input";
import { Edit, Trash2, Plus } from 'lucide-react';
import EditClothModal from "../../../../component/EditclothModal";
import AddClothModal from "../../../../component/AddClothModal";
export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lowStock, setLowStock] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/cloths");
      const products = Array.isArray(res.data) ? res.data : [];
      setInventory(products);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setInventory([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.brandName.toLowerCase().includes(search.toLowerCase());

    if (!lowStock) return matchesSearch;

    return matchesSearch && item.quantity < 10;
  });

  // ✅ Shortcuts + Navigation
  useEffect(() => {
    if (isAddModalOpen || isEditModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        document.getElementById("search-box")?.focus();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedItems.length > 0) deleteSelected();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setLowStock((prev) => !prev);
      }

      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAddModalOpen(true);
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredInventory.length - 1 ? prev + 1 : prev
        );
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const current = filteredInventory[focusedIndex];
        if (current) toggleSelect(current._id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen, isEditModalOpen, selectedItems, filteredInventory, focusedIndex]);

  // ✅ Toggle single select
  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async (updated) => {
    try {
      const res = await axios.put("/api/cloths", updated);
      setInventory((prev) => prev.map((item) => (item._id === updated.id ? res.data : item)));
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleAdd = async (newProduct) => {
    try {
      const res = await axios.post("/api/cloths", newProduct);
      setInventory((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  // ✅ Toggle all
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredInventory.map((item) => item._id));
    }
  };

  const deleteSelected = async () => {
    try {
      await axios.delete("/api/cloths", { data: { ids: selectedItems } });
      setInventory((prev) =>
        prev.filter((item) => !selectedItems.includes(item._id))
      );
      setSelectedItems([]);
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  // ✅ Highlight search
  const highlightText = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="p-4">
      {/* Search & Actions */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products Inventory</h1>
        <div className="flex gap-3 flex-wrap">
          <Input
            id="search-box"
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Product
            </Button>
            {/* <Button
              onClick={() => setLowStock((p) => !p)}
              variant={lowStock ? "destructive" : "default"}
            >
              {lowStock ? "Showing Low Stock" : "Low Stock"}
            </Button> */}
            {selectedItems.length > 0 && (
              <Button
                onClick={deleteSelected}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete Selected (
                {selectedItems.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border p-2 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length === filteredInventory.length &&
                    filteredInventory.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-red-950">No</TableHead>
              <TableHead className="text-blue-600">SKU</TableHead>
              <TableHead className="text-blue-600">Product Name</TableHead>
              <TableHead className="text-primary">Brand</TableHead>
              <TableHead className="text-primary">Category</TableHead>
              <TableHead className="text-primary">Fabric Type</TableHead>
              <TableHead className="text-primary">Color</TableHead>
              <TableHead className="text-primary">Size</TableHead>
              <TableHead className="text-green-500">Quantity</TableHead>
              <TableHead className="text-primary">Cost Price</TableHead>
              <TableHead className="text-primary">Selling Price</TableHead>
              <TableHead className="text-primary text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-6">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item, index) => (
                <TableRow
                  key={item._id}
                  className={
                    index === focusedIndex
                      ? "bg-gray-100 border-l-4 border-blue-500"
                      : ""
                  }
                >
                  <TableCell className="border">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => toggleSelect(item._id)}
                    />
                  </TableCell>
                  <TableCell className="text-red-950 border">{index + 1}</TableCell>
                  <TableCell className="text-blue-600 border">
                    {highlightText(item.sku, search)}
                  </TableCell>
                  <TableCell className="text-blue-600 border">
                    {highlightText(item.name, search)}
                  </TableCell>
                  <TableCell className="text-primary border">
                    {highlightText(item.brandName, search)}
                  </TableCell>
                  <TableCell className="text-primary border">
                    {highlightText(item.category, search)}
                  </TableCell>
                  <TableCell className="text-primary border">
                    {item.fabricType}
                  </TableCell>
                  <TableCell className="text-primary border">
                    {item.color}
                  </TableCell>
                  <TableCell className="text-primary border">
                    {item.size}
                  </TableCell>
                  <TableCell className={`${item.quantity < 10 ? "text-red-500 font-semibold" : "text-green-500"} border`}>
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-primary border">
                    ₨ {item.costPrice}
                  </TableCell>
                  <TableCell className="text-primary border">
                    ₨ {item.sellingPrice}
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end border">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingProduct(item);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteSelected([item._id])}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <EditClothModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        onSave={handleSave}
      />
      <AddClothModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAdd}
      />
    </div>
  );
}
