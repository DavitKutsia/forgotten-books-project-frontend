import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartPieUsers from "../components/PiechartUsers";
import ChartLineProducts from "../components/PiechartProducts";
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
import { Ellipsis } from "lucide-react";

export default function Adminpanel() {
  const [edit, setEdit] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [buyerUsers, setBuyerUsers] = useState([]);
  const [editProductId, setEditProductId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    price: "",
  });
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [sellerUsers, setSellerUsers] = useState([]);

  const handleUserEditClick = (buyer) => {
    setEditUserId(buyer._id);
    setEditUserData({
      name: buyer.name,
      email: buyer.email,
      password: buyer.password,
      role: buyer.role,
    });
  };

  const handleUserCancelEdit = () => {
    setEditUserId(null);
    setEditUserData({ name: "", email: "", password: "", role: "" });
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setEditUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserUpdate = async (buyerId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/buyers/${buyerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editUserData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update user");
        return;
      }

      setBuyerUsers((prev) =>
        prev.map((u) => (u._id === buyerId ? { ...u, ...editUserData } : u))
      );

      handleUserCancelEdit();
    } catch (err) {
      alert("Something went wrong.");
    }
  };

  const handleUserDelete = async (buyerId) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Delete this user?")) return;

    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/buyers/${buyerId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        alert("Failed to delete user");
        return;
      }

      setBuyerUsers((prev) => prev.filter((u) => u._id !== buyerId));
    } catch (err) {
      alert("Something went wrong");
    }
  };

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

        const user = data?.user;

        if (!res.ok || !user) {
          navigate("/SignUp");
          return;
        }

        if (user.role !== "admin") {
          navigate("/SignUp");
          return;
        }

        setUserData(user);
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

  useEffect(() => {
    const fetchBuyerUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/SignUp");
        return;
      }
      try {
        const res = await fetch(
          "https://forgotten-books-project-backend.vercel.app/buyers",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setBuyerUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchBuyerUsers();
  }, [navigate]);
  useEffect(() => {
    const fetchAllProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/SignUp");
        return;
      }
      try {
        const res = await fetch(
          "https://forgotten-books-project-backend.vercel.app/products",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAllProducts();
  }, []);

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
    const token = localStorage.getItem("token");

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
    const token = localStorage.getItem("token");

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
  const handleSellerEditClick = (seller) => {
    setEditUserId(seller._id);
    setEditUserData({
      name: seller.name,
      email: seller.email,
      password: seller.password,
      role: seller.role,
    });
  };

  const handleSellerUpdate = async (sellerId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/sellers/${sellerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editUserData),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update seller");
        return;
      }
      setSellerUsers((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, ...editUserData } : s))
      );
      handleUserCancelEdit();
    } catch (err) {
      alert("Something went wrong.");
    }
  };

  const handleSellerDelete = async (sellerId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Delete this seller?")) return;
    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/sellers/${sellerId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        alert("Failed to delete seller");
        return;
      }
      setSellerUsers((prev) => prev.filter((s) => s._id !== sellerId));
    } catch (err) {
      alert("Something went wrong");
    }
  };
  useEffect(() => {
    const fetchSellerUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/SignUp");
        return;
      }
      try {
        const res = await fetch(
          "https://forgotten-books-project-backend.vercel.app/sellers",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch sellers");
        const data = await res.json();
        setSellerUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSellerUsers();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-[#0a192f] text-gray-100 flex flex-col">
      <Header />

      {/* Charts Section */}
      <section className="pt-28 px-10 flex flex-wrap justify-center items-start gap-10">
        <ChartPieUsers data={stats?.pieChartUsersData} />
        <ChartLineProducts data={stats?.lineChartProductsData} />
      </section>

      {/* Products Table */}
      <section className="mt-14 px-10">
        <h1 className="text-3xl font-bold mb-6 text-blue-300">Products</h1>
        <div className="overflow-x-auto rounded-2xl border border-[#1b2d4f] bg-[#112240]/70 backdrop-blur-lg shadow-xl">
          <table className="min-w-full text-left text-gray-200">
            <thead className="bg-[#1b2d4f]/70 text-blue-300">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-[#1b2d4f] hover:bg-[#1e3a5f]/50 transition"
                >
                  <td className="py-3 px-4">
                    {editProductId === product._id ? (
                      <Input
                        name="title"
                        value={editData.title}
                        onChange={handleChange}
                        className="bg-[#333333] text-white"
                      />
                    ) : (
                      product.title
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editProductId === product._id ? (
                      <textarea
                        name="content"
                        value={editData.content}
                        onChange={handleChange}
                        rows={3}
                        className="w-full resize-none bg-[#333333] text-white p-2 rounded"
                      />
                    ) : (
                      product.content || "—"
                    )}
                  </td>
                  <td className="py-3 px-4 text-yellow-400 font-semibold">
                    {editProductId === product._id ? (
                      <Input
                        type="number"
                        name="price"
                        value={editData.price}
                        onChange={handleChange}
                        className="bg-[#333333] text-white"
                      />
                    ) : (
                      `$${product.price}`
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {editProductId === product._id ? (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleUpdate(product._id)}>
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-500 hover:text-red-400 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Users Table */}
      <section className="mt-16 px-10 mb-20">
        <h1 className="text-3xl font-bold mb-6 text-blue-300">
          Buyers / Explorers
        </h1>
        <div className="overflow-x-auto rounded-2xl border border-[#1b2d4f] bg-[#112240]/70 backdrop-blur-lg shadow-xl">
          <table className="min-w-full text-left text-gray-200">
            <thead className="bg-[#1b2d4f]/70 text-blue-300">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buyerUsers.map((buyer) => (
                <tr
                  key={buyer._id}
                  className="border-b border-[#1b2d4f] hover:bg-[#1e3a5f]/50 transition"
                >
                  <td className="py-3 px-4">
                    {editUserId === buyer._id ? (
                      <Input
                        name="name"
                        value={editUserData.name}
                        onChange={handleUserChange}
                        className="bg-[#333333] text-white"
                      />
                    ) : (
                      buyer.name
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editUserId === buyer._id ? (
                      <Input
                        name="email"
                        value={editUserData.email}
                        onChange={handleUserChange}
                        className="bg-[#333333] text-white"
                      />
                    ) : (
                      buyer.email
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editUserId === buyer._id ? (
                      <Input
                        name="role"
                        value={editUserData.role}
                        onChange={handleUserChange}
                        className="bg-[#333333] text-white"
                      />
                    ) : (
                      buyer.role
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {editUserId === buyer._id ? (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleUserUpdate(buyer._id)}>
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleUserCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleUserEditClick(buyer)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleUserDelete(buyer._id)}
                          className="text-red-500 hover:text-red-400 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* Sellers Table */}
      <section className="mt-16 px-10 mb-20">
        <h1 className="text-3xl font-bold mb-6 text-blue-300">Sellers</h1>
        <div className="overflow-x-auto rounded-2xl border border-[#1b2d4f] bg-[#112240]/70 backdrop-blur-lg shadow-xl">
          <table className="min-w-full text-left text-gray-200">
            <thead className="bg-[#1b2d4f]/70 text-blue-300">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellerUsers.map((seller) => (
                <tr
                  key={seller._id}
                  className="border-b border-[#1b2d4f] hover:bg-[#1e3a5f]/50 transition"
                >
                  <td className="py-3 px-4">
                    {editUserId === seller._id ? (
                      <Input
                        name="name"
                        value={editUserData.name}
                        onChange={handleUserChange}
                        className="bg-[#333333] text-white"
                      />
                    ) : (
                      seller.name
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editUserId === seller._id ? (
                      <Input
                        name="email"
                        value={editUserData.email}
                        onChange={handleUserChange}
                        className="bg-[#333333] text-white"
                      />
                    ) : (
                      seller.email
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editUserId === seller._id ? (
                      <Input
                        name="role"
                        value={editUserData.role}
                        onChange={handleUserChange}
                        className="bg-[#333333] text-white"
                      />
                    ) : (
                      seller.role
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {editUserId === seller._id ? (
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleSellerUpdate(seller._id)}>
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleUserCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleSellerEditClick(seller)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSellerDelete(seller._id)}
                          className="text-red-500 hover:text-red-400 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
