import React from "react";
import { motion } from "framer-motion";

export default function ReviewCard({ name, role, text, avatar }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-800 text-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 max-w-sm"
    >
      <div className="flex items-center gap-4 mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-14 h-14 rounded-full object-cover border-2 border-[#4169E1]"
        />
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
      </div>

      <p className="text-gray-300 italic leading-relaxed">“{text}”</p>
    </motion.div>
  );
}
