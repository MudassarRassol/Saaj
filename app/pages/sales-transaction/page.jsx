"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Link from "next/link";
import axios from "axios";
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export default function SalesTransactionPage() {
  const [inventory, setInventory] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [serviceprice, setserviceprice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const discountRef = useRef(null);
  const serviceRef = useRef(null);


  const router = useRouter();
  const qtyRefs = useRef({});

  useEffect(() => {
    const savedItems = localStorage.getItem("cartItems");
    if (savedItems) {
      const parsed = JSON.parse(savedItems).map((item) => ({
        ...item,
        saleQuantity: item.saleQuantity || 1,
      }));
      setInventory(parsed);
    }
  }, []);

  useEffect(() => {
    const handleBack = (e) => {
      if (e.key === "ArrowLeft") {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
          e.preventDefault();
          handleGoBack();
        }
      }
    };

    window.addEventListener("keydown", handleBack);
    return () => window.removeEventListener("keydown", handleBack);
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;

      if (activeTag === "INPUT" || activeTag === "TEXTAREA") {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();
        }

        if (e.key === "Escape") {
          e.preventDefault();
          document.activeElement?.blur();
          setIsInputFocused(false);
        }

        if (e.key === "Enter") {
          e.preventDefault();
          document.activeElement?.blur();
          setIsInputFocused(false);
          setHighlightedIndex((prev) =>
            prev < inventory.length - 1 ? prev + 1 : 0
          );
        }
        return;
      }

      if (e.key === "ArrowUp" && !isInputFocused) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : inventory.length - 1
        );
      }

      if (e.key === "ArrowDown" && !isInputFocused) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < inventory.length - 1 ? prev + 1 : 0
        );
      }

      if (e.key === "Enter" && !isInputFocused) {
        e.preventDefault();
        const currentItem = inventory[highlightedIndex];
        if (currentItem && qtyRefs.current[currentItem._id]) {
          qtyRefs.current[currentItem._id].focus();
          setIsInputFocused(true);
        }
      }

      if (e.key === "Tab" && !isInputFocused) {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < inventory.length - 1 ? prev + 1 : 0
        );
      }

      if (e.key === "ArrowRight" && !isInputFocused) {
        e.preventDefault();
        handlePrint();
      }

      if (e.key === "ArrowLeft" && !isInputFocused) {
        e.preventDefault();
        handleGoBack();
      }

      if (!isInputFocused && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const currentItem = inventory[highlightedIndex];
        if (currentItem) {
          const newQty = parseInt(e.key);
          handleQuantityChange(currentItem._id, newQty);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inventory, highlightedIndex, isInputFocused]);

  useEffect(() => {
    const handleShortcut = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        discountRef.current?.focus();
        setIsInputFocused(true);
      }

      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        serviceRef.current?.focus();
        setIsInputFocused(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!showTranscript) return;

    const handleEnterClose = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setShowTranscript(false);
        localStorage.removeItem("cartItems");
        router.push("/pages/staff");
      }
    };

    window.addEventListener("keydown", handleEnterClose);
    return () => window.removeEventListener("keydown", handleEnterClose);
  }, [showTranscript, router]);

  const handleQuantityChange = (id, qty) => {
    if (isNaN(qty) || qty < 1) return;

    setInventory((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              saleQuantity: Math.min(Math.max(1, qty), item.quantity),
            }
          : item
      )
    );
  };

  const handleInputChange = (id, value) => {
    if (value === "") {
      setInventory((prev) =>
        prev.map((item) => (item._id === id ? { ...item, saleQuantity: "" } : item))
      );
      return;
    }

    const qty = parseInt(value);
    if (!isNaN(qty) && qty >= 1) {
      setInventory((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                saleQuantity: Math.min(Math.max(1, qty), item.quantity),
              }
            : item
        )
      );
    }
  };

  const handleDelete = (id) => {
    setInventory((prev) => {
      const newInventory = prev.filter((item) => item._id !== id);
      localStorage.setItem("cartItems", JSON.stringify(newInventory));
      return newInventory;
    });

    if (highlightedIndex >= inventory.length - 1) {
      setHighlightedIndex(Math.max(0, inventory.length - 2));
    }
  };

  const handleGoBack = () => {
    localStorage.setItem("cartItems", JSON.stringify(inventory));
    router.push("/pages/staff");
  };

  const handleCancel = () => {
    localStorage.removeItem("cartItems");
    router.push("/pages/staff");
  };

  const subtotal = inventory.reduce(
    (acc, item) => acc + item.sellingPrice * (item.saleQuantity || 1),
    0
  );
  const discountAmount = Math.min(discount, subtotal);
  const discountPercent =
    subtotal > 0 ? ((discountAmount / subtotal) * 100).toFixed(2) : 0;
  const total = subtotal - discountAmount + serviceprice;

  const handlePrint = async () => {
    if (inventory.length === 0) {
      alert("No products in cart!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: inventory.map((item) => ({
          productId: item._id || item.id,
          name: item.name,
          quantity: item.saleQuantity || 1,
          sellingPrice: item.sellingPrice,
          totalAmount: item.sellingPrice * (item.saleQuantity || 1),
          profit:
            (item.sellingPrice - item.costPrice) * (item.saleQuantity || 1),
        })),
        discount: discountAmount,
        finalTotal: total,
        serviceprice: serviceprice,
      };
      console.log(payload);
      await axios.post("/api/history", payload);
      setShowTranscript(true);
    } catch (err) {
      console.error("Print failed:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = (index) => {
    setIsInputFocused(true);
    setHighlightedIndex(index);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    setInventory((prev) =>
      prev.map((item) =>
        item.saleQuantity === "" || item.saleQuantity < 1
          ? { ...item, saleQuantity: 1 }
          : item
      )
    );
  };

  return (
    <div className="p-6 sm:p-10 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-700">
          👕 Sales Transaction
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="hover:bg-green-100 hover:text-green-600 border-green-300"
          >
            ← Add More Products
          </Button>
          <Link href="/pages/staff">
            <Button
              variant="outline"
              className="hover:bg-blue-100 hover:text-blue-600"
            >
              View Inventory
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center w-[100%]">
        <div className="p-2 md:w-[70%] flex items-center justify-center">
          <div className="flex flex-col lg:w-[60%] gap-6">
            <div className="lg:col-span-2 overflow-x-auto rounded-xl border bg-white shadow-lg">
              <Table>
                <TableHeader className="bg-blue-50">
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item, index) => (
                    <TableRow
                      key={item._id}
                      className={`transition-colors duration-200 ${
                        index === highlightedIndex && !isInputFocused
                          ? "bg-blue-100 font-semibold ring-2 ring-blue-300"
                          : index === highlightedIndex && isInputFocused
                          ? "bg-blue-50 font-semibold"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.saleQuantity}
                          className="w-20 text-center no-spinner bg-white"
                          min="1"
                          max={item.quantity}
                          ref={(el) => (qtyRefs.current[item._id] = el)}
                          onChange={(e) =>
                            handleInputChange(item._id, e.target.value)
                          }
                          onFocus={() => handleInputFocus(index)}
                          onBlur={handleInputBlur}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.target.blur();
                            }
                          }}
                        />
                        <p className="text-xs text-gray-500">
                          Stock: {item.quantity}
                        </p>
                      </TableCell>
                      <TableCell>₨ {item.sellingPrice}</TableCell>
                      <TableCell>
                        ₨ {item.sellingPrice * (item.saleQuantity || 1)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item._id)}
                          className="hover:bg-red-600"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {inventory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No products added to cart.</p>
                  <Button
                    onClick={handleGoBack}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ← Go Add Products
                  </Button>
                </div>
              )}
            </div>

            {/* Checkout Card */}
            <div className="rounded-xl border bg-white shadow-lg p-6 backdrop-blur">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Checkout Summary
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Discount (₨)
                </label>
                <Input
                  ref={discountRef}
                  type="number"
                  value={discount === 0 ? "" : discount}
                  min={0}
                  max={subtotal}
                  onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                  className="mb-2"
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={handleInputBlur}
                />

                <p className="text-xs text-gray-500">
                  {discountAmount} Rs ({discountPercent}%)
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Service (₨)
                </label>
                <Input
                  ref={serviceRef}
                  type="number"
                  value={serviceprice === 0 ? "" : serviceprice}
                  min={0}
                  max={subtotal}
                  onChange={(e) =>
                    setserviceprice(parseInt(e.target.value) || 0)
                  }
                  className="mb-2"
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={handleInputBlur}
                />
              </div>

              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>₨ {subtotal}</p>
                </div>
                <div className="flex justify-between">
                  <p>Service</p>
                  <p>₨ {serviceprice}</p>
                </div>
                <div className="flex justify-between">
                  <p>Discount</p>
                  <p>₨ {discountAmount}</p>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <p>Total Price</p>
                  <p>₨ {total}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  onClick={handlePrint}
                  disabled={loading || inventory.length === 0}
                >
                  {loading ? "Processing..." : "🖨️ Print Bill (→)"}
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  onClick={handleGoBack}
                  disabled={loading}
                >
                  ← Add More (←)
                </Button>
                <Button
                  className="w-24 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  ✖ Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={showTranscript}
        onOpenChange={(open) => {
          setShowTranscript(open);
          if (!open) {
            localStorage.removeItem("cartItems");
            router.push("/pages/staff");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-blue-700">
              🧾 Sales Receipt
            </DialogTitle>
          </DialogHeader>
          <div id="receipt" className="bg-white p-4 text-sm">
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold">Fashion Store</h1>
              <p className="text-gray-500 text-xs">Quality Clothing | Premium Selection</p>
              <hr className="my-2 border-dashed" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item, index) => (
                  <TableRow key={item._id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.saleQuantity || 1}</TableCell>
                    <TableCell>
                      ₨ {item.sellingPrice * (item.saleQuantity || 1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 border-t pt-2 space-y-1 text-right">
              <p>Gross Total: ₨ {subtotal}</p>
              <p>Discount: ₨ {discountAmount}</p>
              <p className="font-bold text-lg">Net Total: ₨ {total}</p>
            </div>
            <p className="mt-4 text-center text-xs text-gray-500">
              Thank you for shopping with us! 👕
            </p>
            <div className="mt-4 text-center">
              <Button
                onClick={() => {
                  setShowTranscript(false);
                  localStorage.removeItem("cartItems");
                  router.push("/pages/staff");
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Close (Enter)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
