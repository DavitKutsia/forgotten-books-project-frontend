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
      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create product");
      } else {
        setSuccess("Product created successfully!");
        setFormData({ title: "", content: "", price: "" });
        navigate("/userproducts");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full sm:min-h-screen lg:h-screen bg-[#121212] ">
      {" "}
      <Header />
      <div className="absolute w-full   bg-[#121212] pt-50 p-2 ">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-6 max-w-6xl  mx-auto"
        >
          <div className="flex-1 flex flex-col gap-4">
            <Input
              placeholder="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] text-white"
              required
            />
            <textarea
              placeholder="Story content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="resize-none bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] text-white p-3 rounded-md"
              required
            />
          </div>

          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              File
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="bg-[#1E1E1E] text-white border-[1.5px] border-[rgba(255,255,255,0.3)] p-2 rounded"
              />
            </label>

            <label className="flex flex-col gap-1">
              Visibility
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="bg-[#1E1E1E] text-white border-[1.5px] border-[rgba(255,255,255,0.3)] p-2 rounded"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>

            <Input
              placeholder="Tags (comma separated)"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] text-white"
            />

            <Input
              placeholder="Price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] text-white"
              required
            />

            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-400">{success}</p>}

            <Button
              type="submit"
              className="mt-2 bg-[#333333] hover:bg-[#444444] text-white"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
