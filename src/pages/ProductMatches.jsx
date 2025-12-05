import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";

import { useParams, useNavigate } from "react-router-dom";

export default function ProductMatches() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasSubscription, setHasSubscription] = useState(true);
  const [matchCount, setMatchCount] = useState(0);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (id) {
      fetchMatches();
      fetchProduct();
      getUserProfile();
    }
  }, [id]);

  const handleSubscribe = async () => {
    try {
      const resp = await fetch(
        `https://forgotten-books-project-backend.vercel.app/stripe/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productName: "Premium Subscription",
            amount: 9.99,
            description: "Access to all premium features",
          }),
        }
      );

      const data = await resp.json();
      if (!resp.ok)
        throw new Error(data.message || "Failed to start subscription");

      window.location.href = data.url;
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  const getUserProfile = async () => {
    try {
      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/auth/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data);
        console.log(data);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  const fetchMatches = async () => {
  try {
    setLoading(true);

    const res = await fetch(`http://localhost:4000/match/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log("MATCHES RESPONSE:", data);

    setMatchCount(data.count || 0);

    if (!data.matches) {
      setMatches([]); 
      return;
    }

    setMatches(data.matches);

  } catch (err) {
    console.error(err);
    setError("Failed to load matches.");
  } finally {
    setLoading(false);
  }
};


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-blue-400">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Header />
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-red-500 text-xl">{error}</p>
          <Button
            onClick={() => navigate("/userproducts")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to My Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />
      <div className="pt-32 px-4 max-w-6xl mx-auto">
        {/* Back Navigation */}
        <Button
          onClick={() => navigate("/userproducts")}
          variant="outline"
          className="mb-6 border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          ← Back to My Products
        </Button>

        {/* Product Info */}
        {product && (
          <Card className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] mb-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Matches for "{product.title}"
              </CardTitle>
              <p className="text-gray-400">
                Track who's interested in your product
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {matchCount}
                  </div>
                  <div className="text-sm text-gray-400">Total Matches</div>
                </div>
                <div className="text-yellow-400 font-semibold">
                  ${product.price}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Check */}
        {user && !user.subscriptionActive ? (
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                🔒 Premium Feature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-2">
                  You have {matchCount} match{matchCount !== 1 ? "es" : ""}!
                </h3>
                <p className="text-gray-300 mb-6">
                  Upgrade your subscription to see who matched with your product
                  and connect with potential buyers.
                </p>
                <Button
                  onClick={handleSubscribe}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3"
                >
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Matches List */
          <div>
            <h2 className="text-xl font-bold mb-6">
              People Who Matched ({matchCount})
            </h2>

            {matches.length === 0 ? (
              <Card className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)]">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2">No matches yet</h3>
                  <p className="text-gray-400">
                    When people swipe right on your product, they'll appear
                    here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {matches.map((match) => (
                  <Card
                    key={match.matchId}
                    className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] hover:border-green-500/50 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">
                          {match.matcher?.name ||
                            match.matcher?.username ||
                            "Anonymous"}
                        </CardTitle>
                        {match.respondedByOwner ? (
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                            ✓ Responded
                          </span>
                        ) : (
                          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-sm">
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-400 text-sm">Email</p>
                          <p className="text-white">
                            {match.matcher?.email || "Hidden"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm">Matched on</p>
                          <p className="text-white">
                            {formatDate(match.createdAt)}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm">Match ID</p>
                          <p className="text-white font-mono text-sm">
                            {match.matchId.slice(0, 8)}...
                          </p>
                        </div>

                        {!match.respondedByOwner && (
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                            Contact Matcher
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
