import React, { useState } from "react";
import { SignupForm } from "../components/signup-form";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { LoginForm } from "../components/login-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Signin() {
  const [color, setColor] = useState("rgba(255, 255, 255, 0.60)");
  const [secondColor, setSecondColor] = useState("#121212");

  const handleAccClick = () => {
    setColor((prev) =>
      prev === "rgba(255, 255, 255, 0.60)"
        ? "#121212"
        : "rgba(255, 255, 255, 0.60)"
    );
    setSecondColor((prev) =>
      prev === "#121212" ? "rgba(255, 255, 255, 0.60)" : "#121212"
    );
    console.log("changed");
  };
  return (
    <div className="w-full bg-[#121212] ">
      <Header />

      <LoginForm />
    </div>
  );
}
