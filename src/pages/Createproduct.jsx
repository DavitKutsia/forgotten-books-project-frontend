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
    title: "",
    content: "",
    price: "",
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

      const productData = {
        title: formData.title,
        content: formData.content,
        price: Number(formData.price)
      };

      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create product");
      } else {
        setSuccess("Product created successfully!");
        setFormData({ title: "", content: "", price: "" });
        setTimeout(() => navigate("/userproducts"), 1500);
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1F] text-white flex flex-col items-center p-6">
      <Header />

      <Card className="w-full max-w-xl bg-[#11182D] border border-[#1E2A47] shadow-xl rounded-2xl mt-[10%]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-300">
            Create Product
          </CardTitle>
          <CardDescription className="text-blue-200 opacity-70">
            Add a new product :)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <FieldGroup>
              <Field>
                <FieldLabel className="text-blue-300">Title</FieldLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  className="bg-[#0F162B] text-white border-[#2A3B67] focus:ring-blue-400"
                />
              </Field>

              <Field>
                <FieldLabel className="text-blue-300">Description</FieldLabel>
                <Input
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="bg-[#0F162B] text-white border-[#2A3B67] focus:ring-blue-400"
                />
              </Field>

              <Field>
                <FieldLabel className="text-blue-300">Price</FieldLabel>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  className="bg-[#0F162B] text-white border-[#2A3B67] focus:ring-blue-400"
                />
              </Field>
            </FieldGroup>

            {error && (
              <p className="text-red-400 text-sm font-medium">{error}</p>
            )}
            {success && (
              <p className="text-green-400 text-sm font-medium">{success}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 mt-4"
            >
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
