import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ChartPieLabel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  useEffect(() => {
    const fetchAdminStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/SignUp");
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:4000/admin/stats",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch admin stats");

        const data = await res.json();
        setStats(data.stats);
      } catch (err) {
        console.error(err.message);
        setError("Failed to load admin stats");
      }
    };

    fetchAdminStats();
  }, [navigate]);

  if (error) return <div>{error}</div>;
  if (!stats) return <div>Loading chart...</div>;

  const chartData = Object.entries(stats).map(([key, value]) => ({
    name: key,
    value,
  }));

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Total Users</CardTitle>
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
            fill="#8884d8"
            label={renderLabel}
            labelLine={false} 
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          red are buyers
        </div>
        <div className="flex items-center gap-2 leading-none font-medium">
          blue are sellers
        </div>
      </CardFooter>
    </Card>
  );
}
