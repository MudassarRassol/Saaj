"use client";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./../components/ui/dialog";
import { Input } from "./../components/ui/input";
import { Button } from "./../components/ui/button";
import { Label } from "./../components/ui/label";
import { Loader2 } from 'lucide-react';

export default function EditClothModal({ open, onClose, onSave, product }) {
  console.log(product)
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [brandName, setBrandName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const skuRef = useRef(null);
  const nameRef = useRef(null);
  const categoryRef = useRef(null);
  const fabricTypeRef = useRef(null);
  const colorRef = useRef(null);
  const sizeRef = useRef(null);
  const brandNameRef = useRef(null);
  const quantityRef = useRef(null);
  const costPriceRef = useRef(null);
  const sellingPriceRef = useRef(null);

  useEffect(() => {
    if (product && open) {
      setSku(product.sku || "");
      setName(product.name || "");
      setCategory(product.category || "");
      setFabricType(product.fabricType || "");
      setColor(product.color || "");
      setSize(product.size || "");
      setBrandName(product.brandName || "");
      setQuantity(product.quantity?.toString() || "");
      setCostPrice(product.costPrice?.toString() || "");
      setSellingPrice(product.sellingPrice?.toString() || "");
    }
  }, [product, open]);

  const onlyDigits = (val, maxLen = Infinity) =>
    (val || "").replace(/\D/g, "").slice(0, maxLen);

  const focusNext = (ref) => {
    if (ref?.current) setTimeout(() => ref.current.focus(), 0);
  };

  const focusPrev = (ref) => {
    if (ref?.current)
      setTimeout(() => {
        ref.current.focus();
        try {
          const v = ref.current.value || "";
          ref.current.setSelectionRange(v.length, v.length);
        } catch {}
      }, 0);
  };

  const handleKeyDown = (e, prevRef, nextRef) => {
    const tag =
      e.target && e.target.tagName ? e.target.tagName.toUpperCase() : "";
    if (
      tag === "SELECT" ||
      tag === "TEXTAREA" ||
      e.target.getAttribute?.("role") === "listbox"
    ) {
      return;
    }

    if (e.key === "Backspace") {
      try {
        const input = e.target;
        const caret = input.selectionStart;
        if ((input.value === "" || caret === 0) && prevRef?.current) {
          e.preventDefault();
          focusPrev(prevRef);
          return;
        }
      } catch {}
    }

    if (["ArrowRight", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      if (nextRef?.current) focusNext(nextRef);
      return;
    }

    if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      if (prevRef?.current) focusPrev(prevRef);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (
        sku &&
        name &&
        category &&
        fabricType &&
        color &&
        size &&
        brandName &&
        quantity &&
        costPrice &&
        sellingPrice
      ) {
        handleSubmit();
      } else if (nextRef?.current) {
        focusNext(nextRef);
      }
    }
  };

  const capitalizeWords = (str) =>
    str
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleSubmit = async () => {
    if (
      !sku ||
      !name ||
      !category ||
      !fabricType ||
      !color ||
      !size ||
      !brandName ||
      !quantity ||
      !costPrice ||
      !sellingPrice
    ) {
      return alert("Please fill all the fields");
    }

    if (
      isNaN(Number(quantity)) ||
      isNaN(Number(costPrice)) ||
      isNaN(Number(sellingPrice))
    ) {
      return alert("Please enter valid numbers");
    }

    setLoading(true);
    try {
      await onSave({
        id: product?._id,
        sku,
        name,
        category,
        fabricType,
        color,
        size,
        brandName,
        quantity: Number(quantity),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Clothing Item</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* SKU */}
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              ref={skuRef}
              autoComplete="off"
              spellCheck={false}
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="Enter SKU"
              onKeyDown={(e) => handleKeyDown(e, null, nameRef)}
            />
          </div>

          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Clothing Name</Label>
            <Input
              id="name"
              ref={nameRef}
              autoComplete="off"
              spellCheck={false}
              value={name}
              onChange={(e) => setName(capitalizeWords(e.target.value))}
              placeholder="Enter clothing name"
              onKeyDown={(e) => handleKeyDown(e, skuRef, categoryRef)}
            />
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              ref={categoryRef}
              autoComplete="off"
              spellCheck={false}
              value={category}
              onChange={(e) => setCategory(capitalizeWords(e.target.value))}
              placeholder="e.g., T-Shirt, Jeans, Dress"
              onKeyDown={(e) => handleKeyDown(e, nameRef, fabricTypeRef)}
            />
          </div>

          {/* Fabric Type */}
          <div className="grid gap-2">
            <Label htmlFor="fabricType">Fabric Type</Label>
            <Input
              id="fabricType"
              ref={fabricTypeRef}
              autoComplete="off"
              spellCheck={false}
              value={fabricType}
              onChange={(e) => setFabricType(capitalizeWords(e.target.value))}
              placeholder="e.g., Cotton, Silk, Polyester"
              onKeyDown={(e) => handleKeyDown(e, categoryRef, colorRef)}
            />
          </div>

          {/* Color and Size side by side */}
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                ref={colorRef}
                autoComplete="off"
                spellCheck={false}
                value={color}
                onChange={(e) => setColor(capitalizeWords(e.target.value))}
                placeholder="e.g., Black, Navy Blue"
                onKeyDown={(e) => handleKeyDown(e, fabricTypeRef, sizeRef)}
              />
            </div>

            <div className="grid gap-2 flex-1">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                ref={sizeRef}
                autoComplete="off"
                spellCheck={false}
                value={size}
                onChange={(e) => setSize(e.target.value.toUpperCase())}
                placeholder="e.g., S, M, L, XL"
                onKeyDown={(e) => handleKeyDown(e, colorRef, brandNameRef)}
              />
            </div>
          </div>

          {/* Brand Name */}
          <div className="grid gap-2">
            <Label htmlFor="brandName">Brand Name</Label>
            <Input
              id="brandName"
              ref={brandNameRef}
              autoComplete="off"
              spellCheck={false}
              value={brandName}
              onChange={(e) => setBrandName(capitalizeWords(e.target.value))}
              placeholder="Enter brand name"
              onKeyDown={(e) => handleKeyDown(e, sizeRef, quantityRef)}
            />
          </div>

          {/* Quantity */}
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              ref={quantityRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              onChange={(e) => setQuantity(onlyDigits(e.target.value))}
              placeholder="Enter quantity"
              onKeyDown={(e) => handleKeyDown(e, brandNameRef, costPriceRef)}
            />
          </div>

          {/* Cost Price and Selling Price side by side */}
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="costPrice">Cost Price (₨)</Label>
              <Input
                id="costPrice"
                ref={costPriceRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                value={costPrice}
                onChange={(e) =>
                  setCostPrice((prev) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, "");
                    const parts = raw.split(".");
                    return parts.length > 1
                      ? parts[0] + "." + parts.slice(1).join("")
                      : raw;
                  })
                }
                placeholder="Enter cost price"
                onKeyDown={(e) => handleKeyDown(e, quantityRef, sellingPriceRef)}
              />
            </div>

            <div className="grid gap-2 flex-1">
              <Label htmlFor="sellingPrice">Selling Price (₨)</Label>
              <Input
                id="sellingPrice"
                ref={sellingPriceRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*"
                value={sellingPrice}
                onChange={(e) =>
                  setSellingPrice((prev) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, "");
                    const parts = raw.split(".");
                    return parts.length > 1
                      ? parts[0] + "." + parts.slice(1).join("")
                      : raw;
                  })
                }
                placeholder="Enter selling price"
                onKeyDown={(e) => handleKeyDown(e, costPriceRef, null)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
