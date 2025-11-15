import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import Header from "../components/Header";

export default function CreateProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    matchId: "",
    productId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      
      const matchData = {
        matchId: formData.matchId,
        productId: formData.productId,
      };

      console.log("Sending match data:", matchData);
      console.log("Token:", token ? "Token exists" : "No token");

      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(matchData),
        }
      );

      const data = await res.json();
      console.log("Backend response:", data);
      console.log("Response status:", res.status);

      if (!res.ok) {
        setError(data.message || "Failed to create match");
      } else {
        setSuccess("Match created successfully!");
        setFormData({ matchId: "", productId: "" });
        setTimeout(() => {
          navigate("/userproducts");
        }, 1500);
      }
    } catch (err) {
      console.error("Request error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#121212]">
      <Header />
      <div className="pt-32 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Create New Match</h1>
          
          <Card className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)]">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <FieldLabel className="text-white mb-2">Match ID</FieldLabel>
                  <Input
                    placeholder="Enter unique match ID"
                    name="matchId"
                    value={formData.matchId}
                    onChange={handleChange}
                    className="bg-[#333333] border-[1.5px] border-[rgba(255,255,255,0.3)] text-white"
                    required
                  />
                  <FieldDescription className="text-gray-400 text-sm mt-1">
                    Must be unique across all matches
                  </FieldDescription>
                </div>

                <div>
                  <FieldLabel className="text-white mb-2">Product ID</FieldLabel>
                  <Input
                    placeholder="Enter product ID to match with"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className="bg-[#333333] border-[1.5px] border-[rgba(255,255,255,0.3)] text-white"
                    required
                  />
                  <FieldDescription className="text-gray-400 text-sm mt-1">
                    The ID of the product you want to create a match for
                  </FieldDescription>
                </div>

                {error && (
                  <div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded p-3">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="text-green-400 bg-green-500/10 border border-green-500/20 rounded p-3">
                    {success}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? "Creating Match..." : "Create Match"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    onClick={() => navigate("/userproducts")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}