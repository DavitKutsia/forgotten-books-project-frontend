import React from "react";
import Header from "../components/Header";
import ReviewCard from "../components/ReviewCard";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const navigate = useNavigate();
  const reviews = [
    {
      name: "John Doe",
      role: "Traveler",
      text: "Amazing experience! The stories were captivating and the service was top-notch.",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
      name: "Jane Smith",
      role: "Adventurer",
      text: "A journey like no other. The abandoned places had such rich histories.",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
      name: "Alex Rivers",
      role: "Storyteller",
      text: "Loved exploring forgotten tales. The community is welcoming and full of creativity!",
      avatar: "https://i.pravatar.cc/100?img=3",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <Header />

      <section className="flex flex-col items-center justify-center text-center pt-40 pb-20 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-white">
          Discover and Share Forgotten Stories
        </h1>
        <div className="flex flex-wrap gap-6 justify-center">
          <button 
           onClick={() => {
               navigate("/createproduct");
            }} 
            className="px-8 py-4 bg-[#4169E1] text-white rounded-2xl hover:bg-[#4169E1] hover:scale-105 transition-all shadow-md">
            Start Writing
          </button>
          <button
          onClick={() => navigate("/stories")}
           className="px-8 py-4 bg-gray-700 text-white rounded-2xl hover:bg-gray-600 hover:scale-105 transition-all shadow-md">
            Explore Stories
          </button>
        </div>
      </section>

      {/* Reviews */}
      <section className="flex flex-col items-center justify-center py-16 bg-gray-900">
        <h2 className="text-3xl font-semibold mb-10">What People Are Saying</h2>
        <div className="flex flex-wrap justify-center gap-8 px-6">
          {reviews.map((review, index) => (
            <ReviewCard key={index} {...review} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 flex flex-col items-center gap-6">
        <h3 className="text-2xl font-semibold">Join the Story</h3>
        <button
          onClick={() => {
            navigate("/SignUp");
          }}
          className="px-8 py-3 bg-[#4169E1] text-white rounded-xl hover:bg-[#4169E1] hover:scale-105 transition-all shadow-md"
        >
          Get Started Free
        </button>
        <p className="text-gray-400 text-sm mt-4">
          © {new Date().getFullYear()} Abandoned Stories. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
