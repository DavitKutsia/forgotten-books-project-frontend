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

      if (!res.ok) throw new Error("Failed to fetch user profile");

      const data = await res.json();
      setUser(data.user);
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
    if (!token) navigate("/SignIn");
    else getUserProfile();
  }, [token, navigate]);

  return (
    <div>
      <Header />
      <div id="profileDiv" className="mt-32 text-center text-white">
        {user ? (
          <>
            <h1>Name: {user.name}</h1>
            <h1>Email: {user.email}</h1>
            <h1>Role: {user.role}</h1>

            {user.role !== "admin" && (
              <div id="avatarInputDiv" className="flex flex-col items-center mt-4">
                <img
                  src={user.avatar || "/vite.svg"}
                  alt="avatar"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                  }}
                />
                <div>
                  <label htmlFor="avatarInput">Upload Image</label>
                  <input
                    onChange={handleUploadAvatar}
                    type="file"
                    id="avatarInput"
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <h2>Loading profile...</h2>
        )}
      </div>
    </div>
  );
}
