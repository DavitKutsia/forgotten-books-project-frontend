import React from "react";

export default function BuyButton({ product }) {
  const token = localStorage.getItem("token");

  const handleCheckout = async () => {
    if (!token) {
      alert("You must be logged in to buy a product!");
      return;
    }

    try {
      const resp = await fetch(`http://localhost:4000/stripe/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

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
        Buy Now (${product?.amount ?? product?.price ?? "0"})
    </button>
  );
}
