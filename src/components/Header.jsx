import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import "../App.css";

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileMenu, setProfileMenu] = useState(false);
  const logOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/SignIn");
  };
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

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

        const text = await res.text();

        try {
          const data = JSON.parse(text);
          if (res.ok) {
            setUser(data.user || data);
          } else {
            console.log(localStorage.getItem("token"));

            setUser(null);
          }
        } catch (err) {
          console.error("Response was not JSON.");
        }
      } catch (err) {
        console.error("Fetch failed:", err);
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
        {!user && (
          <button
            onClick={() => navigate("/SignUp")}
            className="hidden md:block text-xl w-[150px] h-[50px] bg-blue-800 rounded-2xl text-white hover:scale-105 transition hover:bg-blue-600 hover:shadow-lg"
          >
            Sign In/Up
          </button>
        )}
        {user && !mobileNavOpen ? (
          <>
            <h1
              onClick={() => {
                setProfileMenu((prev) => !prev);
              }}
              className="text-2xl rounded-2xl relative border-2 p-2 border-[#121212] font-bold cursor-pointer"
            >
              {user.name} 👋
            </h1>{" "}
            {profileMenu && (
              <div className="right-[4%]  top-[90%] flex flex-col gap-2   rounded-2xl p-2 bg-gray-600/60 backdrop-blur-md   absolute">
                <button
                  onClick={() => logOut()}
                  className="p-2 text-red-800 bg-[#121212] cursor-pointer  border-red-950 border-2 text-center text-xl  rounded-2xl"
                >
                  Log Out
                </button>
                {user.role === "seller" && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate("/createproduct")}
                      className="p-2 text-white bg-[#121212] cursor-pointer  border-black border-2 text-center text-xl  rounded-2xl"
                    >
                      Create New Product
                    </button>
                    <button
                      className="p-2 text-white bg-[#121212] cursor-pointer  border-black border-2 text-center text-xl  rounded-2xl"
                      onClick={() => navigate("/userproducts")}
                    >
                      My products
                    </button>
                  </div>
                )}
                {user.role === "admin" && (
                  <button 
                  onClick={() => navigate("/adminpanel")}
                  className="p-2 text-yellow-500 bg-[#121212] cursor-pointer  border-black border-2 text-center text-xl  rounded-2xl">
                    AdminPanel
                  </button>
                )}
              </div>
            )}
          </>
        ) : null}

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
            <span
              onClick={() => {
                navigate("/Aboutus");
                setMobileNavOpen(false);
              }}
              className="block"
            >
              About Us
            </span>
            <span
              onClick={() => {
                navigate("/Contact");
                setMobileNavOpen(false);
              }}
              className="block"
            >
              Contact
            </span>

            {!user ? (
              <button
                onClick={() => {
                  navigate("/SignUp");
                  setMobileNavOpen(false);
                }}
                className="w-full bg-blue-800 text-white py-2 rounded-xl mt-4 hover:bg-blue-600 transition"
              >
                Sign In/Up
              </button>
            ) : (
              <div className="space-y-2">
                <h1
                  onClick={() => setProfileMenu((prev) => !prev)}
                  className="text-xl rounded-xl border-2 p-2 border-[#121212] font-bold cursor-pointer"
                >
                  {user.name} 👋
                </h1>
                {profileMenu && (
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={() => {
                        logOut();
                        setMobileNavOpen(false);
                      }}
                      className="p-2 text-red-800 bg-[#121212] cursor-pointer border-red-950 border-2 text-center text-lg rounded-xl"
                    >
                      Log Out
                    </button>

                    {user.role === "seller" && (
                      <>
                        <button
                          onClick={() => {
                            navigate("/createproduct");
                            setMobileNavOpen(false);
                          }}
                          className="p-2 text-white bg-[#121212] cursor-pointer border-black border-2 text-center text-lg rounded-xl"
                        >
                          Create New Product
                        </button>
                        <button
                          onClick={() => {
                            navigate("/userproducts");
                            setMobileNavOpen(false);
                          }}
                          className="p-2 text-white bg-[#121212] cursor-pointer border-black border-2 text-center text-lg rounded-xl"
                        >
                          My Products
                        </button>
                      </>
                    )}

                    {user.role === "admin" && (
                      <button
                        onClick={() => navigate("/adminpanel")}
                        className="p-2 text-yellow-500 bg-[#121212] cursor-pointer border-black border-2 text-center text-lg rounded-xl"
                      >
                        Admin Panel
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
