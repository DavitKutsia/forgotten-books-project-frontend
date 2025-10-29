import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "../components/Header";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("https://forgotten-books-project-backend.vercel.app/products");
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch products");
        } else {
          setProducts(data.data || []); 
        }
      } catch (err) {
        setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#121212] text-white">
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl mb-6 text-white">All Products</h1>

        {loading && <p className="text-blue-400">Loading products...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product._id}
              className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] shadow-lg"
            >
              <CardHeader>
                <CardTitle className="text-lg text-white">{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  {product.description || product.content || "No description available."}
                </CardDescription>
                <p className="mt-2 text-yellow-400 font-semibold">Price: ${product.price}</p>
                {product.tags && (
                  <p className="mt-1 text-gray-400 text-sm">
                    Tags: {product.tags.join(", ")}
                  </p>
                )}
                {product.visibility && (
                  <p className="mt-1 text-gray-400 text-sm">Visibility: {product.visibility}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && products.length === 0 && (
          <p className="text-gray-400 mt-6">No products found.</p>
        )}
      </div>
    </div>
  );
}
