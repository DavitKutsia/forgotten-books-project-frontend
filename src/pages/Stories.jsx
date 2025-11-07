import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import BuyButton from "../components/BuyButton";

export default function Stories() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `https://forgotten-books-project-backend.vercel.app/products/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch products");
          navigate("/SignUp");
          alert("Please login to view stories!");
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        setError("Something went wrong. Try again.");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token, navigate]);

  return (
    <div className="bg-[#121212] min-h-screen">
      <Header />
      <div className="p-8">
        <h1 className="text-3xl mb-6 text-white">All Stories</h1>
        {loading && <p className="text-blue-400">Loading stories...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const isOwnProduct =
              product.seller?._id === localStorage.getItem("userId");

            return (
              <Card
                key={product._id}
                className={`bg-[#1E1E1E] ${isOwnProduct ? "hidden" : ""} border-[1.5px] border-[rgba(255,255,255,0.3)] shadow-lg`}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    {product.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">
                    {product.description || product.content || "No description available."}
                  </CardDescription>

                  <p className="mt-2 text-yellow-400 font-semibold">
                    Price: ${product.price ?? "0"}
                  </p>

                  <BuyButton product={product} />

                  {product.tags && (
                    <p className="mt-1 text-gray-400 text-sm">
                      Tags: {product.tags.join(", ")}
                    </p>
                  )}
                  {product.seller && (
                    <p className="mt-1 text-gray-400 text-sm">
                      @{product.seller.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
