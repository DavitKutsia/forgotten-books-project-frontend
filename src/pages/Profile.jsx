import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Header from "../components/Header";
import { toast } from "react-toastify";
import "../index.css";

export default function Profile() {
  const [user, setUser] = useState(null);
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
    console.log("Fetched data:", data);

    setUser(data.user || data); 
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

    let uploadUrl;
    if (user?.role === "seller") {
      uploadUrl =
        "https://forgotten-books-project-backend.vercel.app/seller";
    } else if (user?.role === "buyer") {
      uploadUrl =
        "https://forgotten-books-project-backend.vercel.app/buyer";
    } else {
      toast.info("Admin cannot change avatar.");
      return;
    }

    try {
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update avatar");

      toast.success("Avatar updated!");
      setUser(data.data);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/SignIn");
    } else {
      getUserProfile();
    }
  }, [token, navigate]);

  useEffect(() => {
    if (user) {
      console.log(user.name);
      console.log(user.email);
      console.log(user.role);
      console.log(user)
    }
  }, [user]);

return (
  <div className="min-h-screen bg-[#0a192f] text-gray-100 flex flex-col">
    {/* Header stays fixed at top */}
    <Header />

    {/* Main content */}
    <main className="flex-grow flex justify-center items-center px-4 pt-32 pb-16">
      <section className="w-full max-w-2xl bg-[#112240]/70 backdrop-blur-xl border border-[#1b2d4f] rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center transition-all duration-300 hover:shadow-blue-900/30">
        {user ? (
          <div className="flex flex-col items-center">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-blue-300 mb-2">
                {user?.name}
              </h1>
              <p className="text-gray-400">{user?.email}</p>
              <p className="text-gray-400 italic mt-1">Role: {user?.role}</p>
            </div>

            {user?.role !== "admin" && (
              <div id="avatarInputDiv" className="flex flex-col items-center gap-5 mt-4">
                <div className="relative group">
                  <img
                    src={user.avatar || "/vite.svg"}
                    alt="avatar"
                    className="w-36 h-36 object-cover rounded-full border-4 border-blue-400 shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm text-blue-300">
                    Change Photo
                  </div>
                </div>

                <label
                  htmlFor="avatarInput"
                  className="px-5 py-2 rounded-full bg-blue-700 hover:bg-blue-600 text-white text-sm cursor-pointer transition shadow-md hover:shadow-blue-600/40"
                >
                  Upload New Avatar
                </label>
                <input
                  onChange={handleUploadAvatar}
                  type="file"
                  id="avatarInput"
                  className="hidden"
                />
              </div>
            )}

            <div className="mt-10">
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