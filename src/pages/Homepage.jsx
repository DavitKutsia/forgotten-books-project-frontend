import Header from "../components/Header";
import ReviewCard from "../components/ReviewCard";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${backendUrl}/products/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch products");
          navigate("/SignUp");
          alert("Please login to view projects!");
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
  }, [token, navigate, backendUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-gray-100">
      <Header />

      <section className="flex flex-col items-center justify-center text-center pt-40 pb-20 px-4 min-h-[60dvh]">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-white">
          Discover and Collaborate on Forgotten Projects
        </h1>

        <div className="flex flex-wrap gap-6 justify-center">
          <button
            onClick={() => navigate("/createproduct")}
            className="px-8 py-4 bg-[#4169E1] text-white rounded-2xl hover:bg-[#4169E1] hover:scale-105 transition-all shadow-md"
          >
            Start Creating
          </button>

          <button
            onClick={() => navigate("/projects")}
            className="px-8 py-4 bg-gray-700 text-white rounded-2xl hover:bg-gray-600 hover:scale-105 transition-all shadow-md"
          >
            Explore All Projects
          </button>
        </div>
      </section>

      <div className="bg-[#121212]  min-h-[20dvh]">

      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 flex flex-col items-center gap-6">
        <h3 className="text-2xl font-semibold">Join the Story</h3>

        <button
          onClick={() => navigate("/SignUp")}
          className="px-8 py-3 bg-[#4169E1] text-white rounded-xl hover:bg-[#4169E1] hover:scale-105 transition-all shadow-md"
        >
          Get Started Free
        </button>

        <p className="text-gray-400 text-sm mt-4">
          © {new Date().getFullYear()} Abandoned Projects. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
