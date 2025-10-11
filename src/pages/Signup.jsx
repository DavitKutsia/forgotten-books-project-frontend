import React, { useState } from "react";
import { SignupForm } from "../components/signup-form";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Signup() {
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
        <div className="flex absolute bg-[#121212] min-h-screen w-full   flex-col justify-center items-center">
          <Tabs defaultValue="buyer" className=" mt-[9%] lg:w-[500px] ">
            <TabsList
              style={{ border: "2px solid rgba(255, 255, 255, 0.6)" }}
              className="bg-transparent border-2  "
            >
              <TabsTrigger
                style={{ color: color }}
                onClick={handleAccClick}
                value="seller"
              >
                Seller
              </TabsTrigger>
              <TabsTrigger
                style={{ color: secondColor }}
                onClick={handleAccClick}
                value="buyer"
              >
                Explorer
              </TabsTrigger>
            </TabsList>
            <TabsContent value="seller">
              <motion.div
                key="seller"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <SignupForm role="seller" />
              </motion.div>
            </TabsContent>
            <TabsContent value="buyer">
              {" "}
              <motion.div
                key="buyer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <SignupForm role="buyer" />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
}
