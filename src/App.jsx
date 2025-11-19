import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Createproduct from "./pages/Createproduct";
import Userproducts from "./pages/Userproducts";
import Adminpanel from "./pages/Adminpanel";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";
import ProductMatches from "./pages/ProductMatches";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCanceled from "./pages/SubscriptionCanceled";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/SignUp" element={<Signup />} />
        <Route path="/SignIn" element={<Signin />} />
        <Route path="/createproduct" element={<Createproduct />} />
        <Route path="/userproducts" element={<Userproducts />} />
        <Route path="/adminpanel" element={<Adminpanel />} />
        <Route path="/Projects" element={<Projects />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/productmatches/:id" element={<ProductMatches />} />
        <Route path="/subscription-success" element={<SubscriptionSuccess />} />
        <Route
          path="/subscription-canceled"
          element={<SubscriptionCanceled />}
        />
      </Routes>
    </div>
  );
}

export default App;
