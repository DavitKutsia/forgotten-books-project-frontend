import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : type === "info"
      ? "bg-blue-500"
      : "bg-gray-500";

  return (
    <div
      className={`fixed top-24 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in`}
    >
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
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [toasts, setToasts] = useState([]);
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

  const generateFakeProducts = () => {
    const fakeProducts = [
      {
        _id: "fake1",
        title: "The Midnight Chronicles",
        content:
          "A thrilling fantasy adventure set in a world where magic awakens only at midnight. Follow Luna as she discovers her hidden powers and battles ancient demons.",
        price: 12.99,
        user: { _id: "user1", name: "Alexandra Stone" },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "fake2",
        title: "Code & Coffee",
        content:
          "A programmer's journey through Silicon Valley startups. A humorous and insightful look into the world of tech entrepreneurship and late-night coding sessions.",
        price: 8.5,
        user: { _id: "user2", name: "Marcus Chen" },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "fake3",
        title: "Ocean's Whisper",
        content:
          "A marine biologist discovers an underwater civilization. Part science fiction, part environmental thriller. Explores themes of conservation and discovery.",
        price: 15.75,
        user: { _id: "user3", name: "Dr. Sarah Martinez" },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "fake4",
        title: "The Last Bookstore",
        content:
          "In a digital world, one woman fights to save physical books. A dystopian tale about the importance of preserving knowledge and human connection.",
        price: 11.25,
        user: { _id: "user4", name: "Elena Rodriguez" },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "fake5",
        title: "Quantum Hearts",
        content:
          "A love story spanning multiple dimensions. When a physicist discovers parallel universes, she must choose between infinite possibilities and true love.",
        price: 13.99,
        user: { _id: "user5", name: "Dr. James Kim" },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "fake6",
        title: "Street Art Revolution",
        content:
          "The underground world of urban artists fighting gentrification through their art. A gritty tale of creativity, community, and resistance.",
        price: 9.99,
        user: { _id: "user6", name: "Rico Vasquez" },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "fake7",
        title: "The Memory Thief",
        content:
          "In a world where memories can be stolen and sold, a detective must recover her own past. A noir thriller with sci-fi elements.",
        price: 14.5,
        user: { _id: "user7", name: "Detective Morgan Lee" },
        createdAt: new Date().toISOString(),
      },
      {
        _id: "fake8",
        title: "Culinary Time Travel",
        content:
          "A chef discovers recipes that transport her through time. Each dish tells a story from a different era, mixing history with gastronomy.",
        price: 10.75,
        user: { _id: "user8", name: "Chef Isabella Rossi" },
        createdAt: new Date().toISOString(),
      },
    ];
    setProducts(fakeProducts);
    setCurrentIndex(0);
    setLoading(false);
    addToast("Test products loaded! Start swiping to test.", "success");
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      const otherProducts = data.filter(
        (product) => product.user?._id !== currentUserId
      );
      setProducts(otherProducts);

      if (otherProducts.length > 0) {
        addToast(`Loaded ${otherProducts.length} products from API`, "success");
      } else {
        addToast("No products available from API", "info");
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
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/matches/${productId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("Match created:", data.matchId);
        addToast(
          `✨ Match created successfully! ID: ${data.matchId.slice(0, 8)}...`,
          "success"
        );
        return { success: true, data };
      } else {
        console.log("Match creation failed:", data.message);
        addToast(`❌ ${data.message || "Match creation failed"}`, "error");
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error("Error creating match:", err);
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

  const handleMouseDown = (e) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const currentProduct = products[currentIndex];
  const hasMoreProducts = currentIndex < products.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-blue-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Header />
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={generateFakeProducts}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Use Fake Products for Testing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />

      {/* Toast Notifications */}
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

      <div className="pt-32 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Discover Products</h1>
          <Button
            onClick={generateFakeProducts}
            variant="outline"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
          >
            Load Test Data
          </Button>
        </div>

        <div className="flex justify-center items-center min-h-[600px]">
          {hasMoreProducts ? (
            <div className="relative w-full max-w-md">
              {/* Swipe Instructions */}
              <div className="text-center mb-4">
                <p className="text-gray-400">
                  ← Swipe left to pass • Swipe right to match →
                </p>
              </div>

              {/* Product Card */}
              <Card
                ref={cardRef}
                className={`
                  bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] 
                  cursor-grab active:cursor-grabbing
                  transition-all duration-200 ease-out
                  ${
                    swipeDirection === "right"
                      ? "border-green-500 shadow-green-500/20"
                      : ""
                  }
                  ${
                    swipeDirection === "left"
                      ? "border-red-500 shadow-red-500/20"
                      : ""
                  }
                `}
                style={{
                  transform: `translate(${dragOffset.x}px, ${
                    dragOffset.y
                  }px) rotate(${dragOffset.x * 0.1}deg)`,
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
                  <p className="text-gray-400">
                    by @{currentProduct?.user?.name || "Unknown"}
                  </p>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-300 mb-4 line-clamp-4">
                    {currentProduct?.content || "No description available."}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 font-semibold text-lg">
                      ${currentProduct?.price || "0"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentIndex + 1} / {products.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Swipe Direction Indicators */}
              {swipeDirection && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`
                      text-6xl font-bold opacity-80
                      ${
                        swipeDirection === "right"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    `}
                  >
                    {swipeDirection === "right" ? "💚 MATCH" : "❌ PASS"}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
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
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    fetchProducts();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Refresh from API
                </button>
                <Button
                  onClick={generateFakeProducts}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Load Test Data
                </Button>
              </div>
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
