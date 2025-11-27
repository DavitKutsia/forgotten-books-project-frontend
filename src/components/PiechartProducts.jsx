import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie, PieChart, Cell, Label } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProductsChart() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const chartColor = "var(--chart-1)";

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/SignUp");
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:4000/products",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json(); 
        setProducts(data);
      } catch (err) {
        console.error(err.message);
        setError("Failed to load products");
      }
    };

    fetchProducts();
  }, [navigate]);

  if (error) return <div>{error}</div>;
  if (!products.length) return <div>Loading chart...</div>;

  const chartData = [{ name: "Products", value: products.length }];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Products</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <PieChart width={250} height={250}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill={chartColor}
          >
            <Label
              value={products.length}
              position="center"
              fontSize={30}
              fill="#000"
            />
          </Pie>
        </PieChart>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total number of products
        </div>
      </CardFooter>
    </Card>
  );
}
