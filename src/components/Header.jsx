import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import "../App.css";

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      console.log(data)
      if (res.ok) {
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    fetchProfile();
  }, []);
  return (
    <div className="relative">
      <nav className="fixed w-full z-30 bg-gray-600/60 backdrop-blur-md text-gray-300 px-4 sm:px-10 py-5 flex justify-between items-center">
        <h1
          onClick={() => navigate("/")}
          className="cursor-pointer text-2xl sm:text-4xl shps text-white"
        >
          Abandoned Stories
        </h1>

        <section className="hidden md:flex gap-8 text-sm items-center">
          <span
            onClick={() => navigate("/")}
            className="relative hover:scale-105 transition cursor-pointer"
          >
            Homepage
          </span>
          <div
            className="relative hover:scale-105 transition cursor-pointer"
            onClick={() => navigate("/Aboutus")}
          >
            <span>About Us</span>
          </div>
          <span
            onClick={() => navigate("/Contact")}
            className="relative hover:scale-105 transition cursor-pointer"
          >
            Contact
          </span>
        </section>
        {!user ? (
          <button
            onClick={() => navigate("/SignUp")}
            className="hidden md:block text-xl w-[150px] h-[50px] bg-blue-800 rounded-2xl text-white hover:scale-105 transition hover:bg-blue-600 hover:shadow-lg"
          >
            Sign In/Up
          </button>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Welcome back, {user.name} 👋</h1>
            <p className="text-gray-400">{user.email}</p>
          </>
        )}

        <button
          className="md:hidden text-white"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-[80px] left-0 right-0 bg-gray-700 z-20 text-white md:hidden p-6 space-y-4"
          >
            <span
              onClick={() => {
                navigate("/");
                setMobileNavOpen(false);
              }}
              className="block"
            >
              Homepage
            </span>
            <div className="space-y-2">
              <span className="block">About Us</span>
              <div className="ml-4 space-y-1 text-gray-300"></div>
            </div>
            <span
              onClick={() => {
                navigate("/Contact");
                setMobileNavOpen(false);
              }}
              className="block"
            >
              Contact
            </span>
            <button
              onClick={() => {
                setMobileNavOpen(false);
              }}
              className="w-full bg-blue-800 text-white py-2 rounded-xl mt-4 hover:bg-blue-600 transition"
            >
              Sign In/Up
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
