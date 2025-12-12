import React from "react";

export default function BuyButton({ product }) {
  const token = localStorage.getItem("token");

  const handleCheckout = async () => {
    if (!token) {
      alert("You must be logged in to buy a product!");
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    
    try {
      const resp = await fetch(
        `${backendUrl}/stripe/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productName: product.title || product.productName,
            amount: product.price || product.amount,
            description: product.description || "",
          }),
        }
      );

      const data = await resp.json();

      if (resp.ok && data.url) {
        window.location.href = data.url; 
      } else {
        alert(data.message || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error starting checkout. Try again.");
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
    >
      Buy Now (${product?.price ?? product?.amount ?? "0"})
    </button>
  );
}