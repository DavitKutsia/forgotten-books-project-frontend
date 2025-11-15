import React, { useState } from "react";
import { SignupForm } from "../components/signup-form";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { LoginForm } from "../components/login-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Signin() {
  return (
    <div className="w-full min-h-screen bg-[#121212] ">
      <Header />

      <LoginForm />
    </div>
  );
}
