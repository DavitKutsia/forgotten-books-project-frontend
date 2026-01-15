import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductMatches() {
  const { id } = useParams();
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const token = localStorage.getItem("token");

  const [matches, setMatches] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [user, setUser] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // --- Fetch product ---
  const fetchProduct = async () => {
    try {
      const res = await fetch(`${backendUrl}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  // --- Get user profile ---
  const getUserProfile = async () => {
    try {
      const res = await fetch(`${backendUrl}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // --- Fetch matches ---
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/match/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Fetched matches:", data); // DEBUG
      setMatchCount(data.count || 0);
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load matches.");
    } finally {
      setLoading(false);
    }
  };

  // --- Match back with user ---
  const handleMatchBack = async (matchedProductId, matchId) => {
    if (!matchedProductId) {
      alert("Cannot match back - product ID is missing");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/match/${matchedProductId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("✨ Mutual match created! You can now contact each other.");
        // Refresh matches to show updated status
        fetchMatches();
      } else {
        alert(data.message || "Failed to create match");
      }
    } catch (err) {
      console.error("Match back error:", err);
      alert("Failed to match back. Please try again.");
    }
  };

  // --- Open 1-to-1 chat ---
  const openChat = (matcherId) => {
    navigate(`/chat/${matcherId}?productId=${id}`);
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

  const handleSubscribe = async () => {
    try {
      const resp = await fetch(`${backendUrl}/stripe/checkout`, {
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
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Failed to start subscription");
      window.location.href = data.url;
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Initial data load ---
  useEffect(() => {
    if (id) {
      fetchMatches();
      fetchProduct();
      getUserProfile();
    }
  }, [id]);

  // --- Render product detail modal ---
  if (viewingProduct) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Header />
        <div className="pt-32 px-4 max-w-4xl mx-auto">
          <Button
            onClick={() => setViewingProduct(null)}
            variant="outline"
            className="mb-6 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            ← Back to Matches
          </Button>

          <Card className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)]">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                {viewingProduct.title}
              </CardTitle>
              <p className="text-gray-400">Product Details</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Description</p>
                  <CardDescription className="text-gray-300 text-base">
                    {viewingProduct.content || viewingProduct.description || "No description available."}
                  </CardDescription>
                </div>

                {viewingProduct.price && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Price</p>
                    <p className="text-yellow-400 font-semibold text-xl">
                      ${viewingProduct.price}
                    </p>
                  </div>
                )}

                {viewingProduct.tags && viewingProduct.tags.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Tags</p>
                    <p className="text-white">
                      {viewingProduct.tags.join(", ")}
                    </p>
                  </div>
                )}

                {viewingProduct.user && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Posted by</p>
                    <p className="text-white">{viewingProduct.user.name || "Anonymous"}</p>
                    <p className="text-gray-500 text-sm">{viewingProduct.user.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- Render loading state ---
  if (loading)
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-blue-400">Loading matches...</p>
        </div>
      </div>
    );

  // --- Render error state ---
  if (error)
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

  // --- Main render ---
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />
      <div className="pt-32 px-4 max-w-6xl mx-auto">
        <Button
          onClick={() => navigate("/userproducts")}
          variant="outline"
          className="mb-6 border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          ← Back to My Products
        </Button>

        {product && (
          <Card className="bg-[#1E1E1E] border-[1.5px] border-[rgba(255,255,255,0.3)] mb-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Matches for "{product.title}"
              </CardTitle>
              <p className="text-gray-400">Track who's interested in your product</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{matchCount}</div>
                  <div className="text-sm text-gray-400">Total Matches</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user && !user.subscriptionActive ? (
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-white text-xl">🔒 Premium Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-2">
                  You have {matchCount} match{matchCount !== 1 ? "es" : ""}!
                </h3>
                <p className="text-gray-300 mb-6">
                  Upgrade your subscription to see match details and connect with buyers.
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
                    When people swipe right on your product, you'll see them here.
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
                        {match.isMutual || match.respondedByOwner ? (
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                            ✓ Mutual
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
                          <p className="text-white">{match.matcher?.email || "Hidden"}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm">Matched on</p>
                          <p className="text-white">{formatDate(match.createdAt)}</p>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm">Match ID</p>
                          <p className="text-white font-mono text-sm">
                            {match.matchId.slice(0, 8)}...
                          </p>
                        </div>

                        {match.isMutual || match.respondedByOwner ? (
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                            onClick={() => openChat(match.matcher._id)}
                          >
                            Contact Matcher
                          </Button>
                        ) : (
                          <div className="flex flex-col gap-2 mt-4">
                            <Button
                              className="w-full bg-purple-600 hover:bg-purple-700"
                              onClick={() => {
                                if (match.matchedProduct) {
                                  setViewingProduct(match.matchedProduct);
                                } else {
                                  alert("Product information is not available");
                                }
                              }}
                            >
                              See Product
                            </Button>
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleMatchBack(match.matchedProduct?._id, match.matchId)}
                            >
                              Match Back
                            </Button>
                          </div>
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