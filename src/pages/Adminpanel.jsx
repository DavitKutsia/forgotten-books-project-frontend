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
  role: "",
});


  const handleUserEditClick = (user) => {
    setEditUserId(user._id);
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setEditUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserCancelEdit = () => {
    setEditUserId(null);
    setEditUserData({ name: "", email: "", role: "" });
  };

  const handleUserUpdate = async (userId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/users/${userId}`,
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
      if (!res.ok) setError(data.message || "Failed to update user");
      else {
        setBuyerUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, ...editUserData } : u))
        );
        handleUserCancelEdit();
      }
    } catch (err) {
      setError("Something went wrong updating user");
    }
  };

  const handleUserDelete = async (userId) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/users/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) setError("Failed to delete user");
      else setBuyerUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setError("Something went wrong deleting user");
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
        <section className="p-10 bg-gray-800 flex flex-wrap flex-col gap-5 w-full text-gray-200 rounded-lg mt-10">
          <h1 className="text-2xl mb-5">Product List</h1>

          {products.map((product) => (
            <div key={product._id} className="w-full relative">
              <Card
                key={product._id}
                className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] shadow-lg"
              >
                <CardHeader>
                  {editProductId === product._id ? (
                    <Input
                      name="title"
                      value={editData.title}
                      onChange={handleChange}
                      className="bg-[#333333] text-white"
                    />
                  ) : (
                    <CardTitle className="text-lg text-white">
                      {product.title}
                    </CardTitle>
                  )}
                  <Ellipsis
                    onClick={() =>
                      setEdit((prev) =>
                        prev === product._id ? null : product._id
                      )
                    }
                    className="cursor-pointer text-gray-400 absolute right-[3%]"
                  />
                  {edit === product._id && (
                    <div className="absolute opacity-60 top-[30%] right-[1%] bg-gray-700 p-3 rounded-md flex flex-col gap-2 z-50">
                      <button
                        onClick={() => {
                          handleEditClick(product);
                          setEdit(false);
                        }}
                        className="text-white hover:bg-gray-600 px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-900 hover:bg-gray-600 px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {editProductId === product._id ? (
                    <>
                      <textarea
                        name="content"
                        value={editData.content}
                        onChange={handleChange}
                        rows={5}
                        className="w-full resize-none bg-[#333333] p-2 rounded text-white"
                      />
                      <Input
                        type="number"
                        name="price"
                        value={editData.price}
                        onChange={handleChange}
                        className="bg-[#333333] text-white mt-2"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => handleUpdate(product._id)}>
                          Save
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <CardDescription className="text-gray-300">
                        {product.content ||
                          product.content ||
                          "No description available."}
                      </CardDescription>
                      <p className="mt-2 text-yellow-400 font-semibold">
                        Price: ${product.price}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
          {buyerUsers.map((buyer) => (
            <div key={buyer._id} className="w-full relative">
              <Card className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] shadow-lg">
                <CardHeader>
                  {editUserId === buyer._id ? (
                    <>
                      <Input
                        name="name"
                        value={editUserData.name}
                        onChange={handleUserChange}
                        className="bg-[#333333] text-white mb-2"
                      />
                      <Input
                        name="email"
                        value={editUserData.email}
                        onChange={handleUserChange}
                        className="bg-[#333333] text-white mb-2"
                      />
                      <Input
                        name="role"
                        value={editUserData.role}
                        onChange={handleUserChange}
                        className="bg-[#333333] text-white mb-2"
                      />
                      <div className="flex gap-2 mt-2">
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
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-lg text-white">
                        {buyer.name} ({buyer.email}) - {buyer.role}
                      </CardTitle>
                      <Ellipsis
                        onClick={() =>
                          setEdit((prev) =>
                            prev === buyer._id ? null : buyer._id
                          )
                        }
                        className="cursor-pointer text-gray-400 absolute right-[3%]"
                      />
                      {edit === buyer._id && (
                        <div className="absolute opacity-60 top-[30%] right-[1%] bg-gray-700 p-3 rounded-md flex flex-col gap-2 z-50">
                          <button
                            onClick={() => {
                              handleUserEditClick(buyer);
                              setEdit(false);
                            }}
                            className="text-white hover:bg-gray-600 px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleUserDelete(buyer._id)}
                            className="text-red-900 hover:bg-gray-600 px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </CardHeader>
              </Card>
            </div>
          ))}
        </section>
      </section>
    </div>
  );
}
