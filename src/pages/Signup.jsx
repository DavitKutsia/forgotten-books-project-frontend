import React, { useState } from "react";
import { SignupForm } from "../components/signup-form";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Signup() {
  const [color, setColor] = useState("rgba(255, 255, 255, 0.60)");
  const [secondColor, setSecondColor] = useState("#121212");

  return (
    <div className="w-full bg-[#121212] ">
      <Header />
      <div className="flex absolute bg-[#121212] min-h-screen w-full   flex-col justify-center items-center">
        <Tabs
          defaultValue="user"
          className="w-[300px] mt-[100px] lg:w-[500px] "
        >
          <div className="flex flex-col gap-[5%] w-full">
            {" "}
            <TabsContent value="user">
              {" "}
              <motion.div
                key="user"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <SignupForm role="user" />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}