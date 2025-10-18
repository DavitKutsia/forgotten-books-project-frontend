import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Adminpanel() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `https://forgotten-books-project-backend.vercel.app/auth/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to fetch products");
          localStorage.getItem("role");
        } else {
          setUserData(data);
          console.log(data);
        }

        if (data.role !== "admin") {
          navigate("/SignUp");
        }
      } catch (err) {
        setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  return <div>Adminpanel</div>;
}
