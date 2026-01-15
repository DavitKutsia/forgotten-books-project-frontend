import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../components/Header";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : type === "info" ? "bg-blue-500" : "bg-gray-500";

  return (
    <div className={`fixed top-24 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in`}>
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          ×
        </button>
      </div>
    </div>
  );
};

export default function Projects() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [userHasProducts, setUserHasProducts] = useState(null);
  const cardRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const checkUserProducts = async () => {
    try {
      const res = await fetch(`${backendUrl}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const userId = data.user?._id;
      
      const productsRes = await fetch(`${backendUrl}/users/${userId}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const products = await productsRes.json();
      
      const hasProducts = Array.isArray(products) && products.length > 0;
      setUserHasProducts(hasProducts);
      
      // Redirect if no products
      if (!hasProducts) {
        navigate("/createproduct");
      }
    } catch (err) {
      console.error("Failed to check user products", err);
      setUserHasProducts(false);
      navigate("/createproduct");
    }
  };

  const fetchUserMatches = async () => {
    try {
      const res = await fetch(`${backendUrl}/match/user/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((m) => m.productId);
    } catch (err) {
      console.error("Failed to load matches", err);
      return [];
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const matchedProductIds = await fetchUserMatches();
      const res = await fetch(`${backendUrl}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const filtered = data.filter(
        (product) =>
          product.user?._id !== currentUserId &&
          !matchedProductIds.includes(product._id)
      );
      setProducts(filtered);
      if (filtered.length === 0) {
        addToast("No products available", "success");
      }
    } catch (err) {
      setError("Failed to load products");
      addToast("Failed to load products from API", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createMatch = async (productId) => {
    try {
      const res = await fetch(`${backendUrl}/match/${productId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        addToast("✨ Match created successfully!", "success");
        return { success: true, data };
      } else {
        addToast(`❌ ${data.message || "Match creation failed"}`, "error");
        return { success: false, error: data.message };
      }
    } catch (err) {
      addToast("🚫 Network error creating match", "error");
      return { success: false, error: err.message };
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= products.length) return;
    const currentProduct = products[currentIndex];
    if (direction === "right") {
      addToast("💚 Creating match...", "info");
      await createMatch(currentProduct._id);
    } else {
      addToast(`👋 Passed on "${currentProduct.title}"`, "info");
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    startPosRef.current = { x: clientX, y: clientY };
    setSwipeDirection(null);
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    const deltaX = clientX - startPosRef.current.x;
    const deltaY = clientY - startPosRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? "right" : "left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? "right" : "left";
      handleSwipe(direction);
    }
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
  };

  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();
  const handleTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchEnd = () => handleEnd();

  useEffect(() => {
    checkUserProducts();
  }, []);

  useEffect(() => {
    if (userHasProducts === true) {
      fetchProducts();
    }
  }, [userHasProducts]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const currentProduct = products[currentIndex];
  const hasMoreProducts = currentIndex < products.length;

  if (userHasProducts === null || loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-blue-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white">
      <Header />
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
      <div className="min-h-screen w-full mx-auto pt-40 p-4">
        <div className="flex justify-center items-center">
          {hasMoreProducts ? (
            <div className="relative w-full max-w-md">
              <div className="text-center mb-4">
                <p className="text-gray-400">
                  ← Swipe left to pass • Swipe right to match →
                </p>
              </div>
              <Card
                ref={cardRef}
                className={`bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] cursor-grab active:cursor-grabbing transition-all duration-200 ease-out ${
                  swipeDirection === "right" ? "border-green-500 shadow-green-500/20" : ""
                } ${swipeDirection === "left" ? "border-red-500 shadow-red-500/20" : ""}`}
                style={{
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
                  opacity: isDragging ? 0.9 : 1,
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <CardHeader>
                  <CardTitle className="text-white text-xl">
                    {currentProduct?.title || "Untitled"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 line-clamp-4">
                    {currentProduct?.content || "No description available."}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {currentIndex + 1} / {products.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              {swipeDirection && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`text-6xl font-bold opacity-80 ${
                      swipeDirection === "right" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {swipeDirection === "right" ? "💚 MATCH" : "❌ PASS"}
                  </div>
                </div>
              )}
              <div className="flex justify-center gap-8 mt-8">
                <button
                  onClick={() => handleSwipe("left")}
                  className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 text-red-500 flex items-center justify-center text-2xl hover:bg-red-500/30 transition-colors"
                >
                  ❌
                </button>
                <button
                  onClick={() => handleSwipe("right")}
                  className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 text-green-500 flex items-center justify-center text-2xl hover:bg-green-500/30 transition-colors"
                >
                  💚
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl mb-4">No more products!</h2>
              <p className="text-gray-400 mb-8">
                You've seen all available products.
              </p>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}