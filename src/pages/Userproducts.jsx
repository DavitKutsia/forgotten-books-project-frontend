import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function UserProducts({variable}) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editProductId, setEditProductId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    price: "",
  });


  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState("");
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          "http://localhost:4000/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        console.log("PROFILE:", data);

        if (!res.ok) {
          setError(data.message || "Failed to fetch profile");
        } else {
          setUserId(data.user?._id);
        }
      } catch {
        setError("Something went wrong while loading profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (!userId) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `https://forgotten-books-project-backend.vercel.app/users/${userId}/products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        console.log("PRODUCTS:", data);

        if (!res.ok) {
          setError(data.message || "Failed to fetch products");
        } else {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch {
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userId, token]);

  const handleEditClick = (product) => {
    setEditProductId(product._id);
    setEditData({
      title: product.title,
      content: product.content || product.content || "",
      price: product.price,
    });
  };

  const handleCancelEdit = () => {
    setEditProductId(null);
    setEditData({ title: "", content: "", price: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (productId) => {
    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      );

      const data = await res.json();
      if (!res.ok) setError(data.message || "Failed to update product");
      else {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, ...editData } : p))
        );
        handleCancelEdit();
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data;
      try {
        data = await res.json();
      } catch (err) {
        data = null;
      }

      if (!res.ok) setError(data?.message || "Failed to delete product");
      else setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.log(err);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#121212] text-white">
      <Header />
      <div className="max-w-6xl mx-auto pt-40 p-4">
        <h1 className="text-3xl mb-6 text-white">My Products</h1>
        {loading && <p className="text-blue-400">Loading products...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product._id}
              className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] shadow-lg"
            >
              <CardHeader>
                {editProductId === product._id ? (
                  <Input
                    name="title"
                    value={editData.title}
                    onChange={handleChange}
                    className="bg-[#333333] text-white"
                  />
                ) : (
                  <CardTitle className="text-lg text-white">
                    {product.title}
                  </CardTitle>
                )}
              </CardHeader>
              <CardContent>
                {editProductId === product._id ? (
                  <>
                    <textarea
                      name="content"
                      value={editData.content}
                      onChange={handleChange}
                      rows={5}
                      className="w-full resize-none bg-[#333333] p-2 rounded text-white"
                    />
                    <Input
                      type="number"
                      name="price"
                      value={editData.price}
                      onChange={handleChange}
                      className="bg-[#333333] text-white mt-2"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => handleUpdate(product._id)}>
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <CardDescription className="text-gray-300">
                      {product.content ||
                        product.content ||
                        "No description available."}
                    </CardDescription>
                    <p className="mt-2 text-yellow-400 font-semibold">
                      Price: ${product.price}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => handleEditClick(product)}>
                        Edit
                      </Button>
                      <Button
                        onClick={() => navigate(`/productmatches/${product._id}`)}
                        variant="outline"
                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                      >
                        View Matches
                      </Button>
                      <Button
                        onClick={() => handleDelete(product._id)}
                        variant="outline"
                        className="text-red-500 border-red-500"
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && products.length === 0 && (
          <p className="text-gray-400 mt-6">
            You have not created any products yet.
          </p>
        )}
      </div>
    </div>
  );
}
