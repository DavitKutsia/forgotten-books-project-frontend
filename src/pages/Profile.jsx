import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Header from "../components/Header";
import { toast } from "react-toastify";
import "../index.css";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const token = Cookies.get("token") || localStorage.getItem("token");

  const getUserProfile = async () => {
    try {
      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/auth/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setUser(data.user || data);
      console.log(data);
      setFormData({
        name: data.user?.name || data.name || "",
        email: data.user?.email || data.email || "",
        password: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch profile");
      navigate("/SignIn");
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/users/upload-avatar",
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update avatar");

      toast.success("Avatar updated!");
      setUser(data.data || data);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/users/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      toast.success("Profile updated successfully!");
      setUser(data.user || data);
      setEditMode(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
    }
  };

const handleSubscribe = async () => {
  try {
    const resp = await fetch(
      `https://forgotten-books-project-backend.vercel.app/stripe/checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName: "Premium Subscription",
          amount: 9.99, 
          description: "Access to all premium features"
        }),
      }
    );

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to start subscription");

    window.location.href = data.url;
  } catch (err) {
    toast.error(err.message);
  }
};


  useEffect(() => {
    if (!token) navigate("/SignIn");
    else getUserProfile();
  }, [token, navigate]);


  return (
    <div className="min-h-screen bg-[#0a192f] text-gray-100 flex flex-col">
      <Header />

      <main className="flex-grow flex justify-center items-center px-4 pt-28 pb-16">
        <section className="w-full max-w-3xl bg-[#112240]/80 backdrop-blur-lg border border-[#1b2d4f] rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center transition-all duration-300 hover:shadow-blue-900/30">
          {user ? (
            <div className="flex flex-col items-center w-full">
              {/* Avatar */}
              <div className="relative mb-8 group">
                <img
                  src={user.avatar || "/vite.svg"}
                  alt="avatar"
                  className="w-36 h-36 object-cover rounded-full border-4 border-blue-400 shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                <label
                  htmlFor="avatarInput"
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm text-blue-300 cursor-pointer"
                >
                  Change Photo
                </label>
                <input
                  onChange={handleUploadAvatar}
                  type="file"
                  id="avatarInput"
                  className="hidden"
                />
              </div>

              {/* Info */}
              <div className="mb-6">
                <h1 className="text-4xl font-semibold text-blue-300 mb-1">
                  {user?.name}
                </h1>
                <p className="text-gray-400">{user?.email}</p>
                <p className="text-green-400 text-sm mt-1">
                  {user?.subscriptionActive ? "Premium User" : "Free User"}
                </p>

                <p
                  className={`text-sm italic mt-1 ${
                    user?.role === "admin" ? "text-red-400" : "text-blue-400"
                  }`}
                >
                  {user?.role === "admin" ? "Admin Account" : "User Account"}
                </p>
              </div>

              {/* Edit Form */}
              <div className="w-full flex justify-center items-center mt-4">
                {!editMode ? (
                  <div className="flex flex-col gap-3 w-[30%] text-center">
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded-xl shadow-md hover:shadow-blue-600/40 text-white transition"
                    >
                      Edit Profile
                    </button>

                    <button
                      onClick={() => navigate("/userproducts")}
                      className="px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded-xl shadow-md hover:shadow-blue-600/40 text-white transition"
                    >
                      View My Products
                    </button>

                    <button
                      onClick={handleSubscribe}
                      className="px-6 py-2 bg-green-700 hover:bg-green-600 rounded-xl shadow-md hover:shadow-green-600/40 text-white transition"
                    >
                      Subscribe (Premium)
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleUpdateProfile}
                    className="flex flex-col gap-5 mt-6 text-left w-full max-w-md mx-auto"
                  >
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-2 rounded-md bg-[#0a192f] border border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full p-2 rounded-md bg-[#0a192f] border border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep old password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full p-2 rounded-md bg-[#0a192f] border border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3 mt-3">
                      <button
                        type="submit"
                        className="flex-1 bg-green-700 hover:bg-green-600 text-white py-2 rounded-md shadow-md hover:shadow-green-700/40"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md shadow-md hover:shadow-gray-600/30"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Back button */}
              <div className="mt-12">
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2 bg-blue-800 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-blue-700/40 text-white transition"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          ) : (
            <h2 className="text-blue-300 text-lg animate-pulse mt-12">
              Loading profile...
            </h2>
          )}
        </section>
      </main>
    </div>
  );
}

