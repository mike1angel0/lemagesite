"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/components/ui/cart-provider";

interface AddToCartButtonProps {
  productId: string;
  title: string;
  price: number;
  image?: string;
  variant?: string;
  label?: string;
  className?: string;
}

export function AddToCartButton({
  productId,
  title,
  price,
  image,
  variant,
  label = "Add to Cart",
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ productId, title, price, image, variant });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAdd}
      className={
        className ||
        "inline-flex items-center gap-2 bg-accent text-bg font-sans text-sm rounded-md px-4 py-2.5 hover:opacity-90 transition-opacity"
      }
    >
      {added ? (
        <>
          <Check size={14} />
          Added
        </>
      ) : (
        <>
          <ShoppingCart size={14} />
          {label}
        </>
      )}
    </button>
  );
}
