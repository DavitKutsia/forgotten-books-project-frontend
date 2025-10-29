import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartPieUsers from "../components/PiechartUsers";
import ChartLineProducts from "../components/PiechartProducts";
import Header from "../components/Header";
export default function Adminpanel() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/SignUp");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          "https://forgotten-books-project-backend.vercel.app/auth/profile",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch user profile");
          return;
        }

        setUserData(data);

        if (data.user.role !== "admin") {
          navigate("/SignUp");
        }
      } catch (err) {
        setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);


  useEffect(() => {
  const fetchAdminStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/SignUp");
      return;
    }

    try {
      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/admin/stats",
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



  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

return (
  <div className="flex gap-10 w-full min-h-screen justify-center items-center">
    <section className="w-full min-h-screen justify-center items-center">
      <Header />
      <section className="flex flex-wrap py-30 justify-center items-start gap-10">
        <ChartPieUsers data={stats?.pieChartUsersData} />
        <ChartLineProducts data={stats?.lineChartProductsData} />

      </section>
      <section className="p-10 bg-gray-800 text-gray-200 rounded-lg mt-10">
        <h1 className="text-2xl mb-5">Product List</h1>
        {products.map((product) => (
          <div key={product._id}>
            <h2 className="text-white">{product.title}</h2>
            <p className="text-gray-300">
              {product.description ||
                product.content ||
                "No description available."}
            </p>
            <p className="text-yellow-400 font-semibold">
              Price: ${product.price}
            </p>
          </div>
        ))}
      </section>
    </section>
  </div>
);
}
