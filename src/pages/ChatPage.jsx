import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import { Send, ArrowLeft } from "lucide-react";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function ChatPage() {
  const { conversationId } = useParams(); // other user's ID
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("productId"); // Just for reference
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [actualConversationId, setActualConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const pollingIntervalRef = useRef(null);

  // ---------------- HELPER: FORMAT DATE ----------------
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    // Just now (less than 1 minute)
    if (diffInMinutes < 1) {
      return "Just now";
    }
    
    // Less than 1 hour
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    // Less than 24 hours
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    // Less than 7 days - show day and time
    if (diffInDays < 7) {
      const time = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      return `${day} ${time}`;
    }
    
    // Older than 7 days - show full date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // ---------------- HELPER: GROUP MESSAGES BY DATE ----------------
  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      if (msgDate !== currentDate) {
        groups.push({ type: 'date', date: msgDate });
        currentDate = msgDate;
      }

      groups.push({ type: 'message', data: msg });
    });

    return groups;
  };

  // ---------------- FETCH CURRENT USER FIRST ----------------
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${backendUrl}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Profile response:", data);
        
        const userId = data.user?._id || data._id;
        console.log("Setting currentUserId to:", userId);
        
        if (userId) {
          setCurrentUserId(userId);
        } else {
          console.error("No user ID found in profile response");
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  // ---------------- FETCH OTHER USER ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userRes = await fetch(`${backendUrl}/users/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        console.log("Other user data:", userData);
        setOtherUser(userData);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId && token) {
      fetchData();
    }
  }, [conversationId, token]);

  // ---------------- GET OR CREATE CONVERSATION ----------------
  useEffect(() => {
    if (!token || !conversationId || !currentUserId) {
      console.log("Skipping get-or-create, missing:", { 
        token: !!token, 
        conversationId, 
        currentUserId 
      });
      return;
    }
    
    console.log("Fetching/creating conversation...");
    fetch(`${backendUrl}/messages/get-or-create`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        receiverId: conversationId,
        productId: productId || null,
      })
    })
    .then(r => r.json())
    .then(data => {
      console.log("Got conversationId:", data.conversationId);
      setActualConversationId(data.conversationId);
    })
    .catch(err => console.error("Failed to get conversation:", err));
  }, [token, conversationId, currentUserId, productId]);

  // ---------------- FETCH CONVERSATION MESSAGES ----------------
  useEffect(() => {
    const fetchMessages = async () => {
      if (!actualConversationId || !token) {
        console.log("Skipping message fetch:", { actualConversationId, token: !!token });
        return;
      }

      try {
        console.log("Fetching messages for conversation:", actualConversationId);
        const msgRes = await fetch(`${backendUrl}/messages/${actualConversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const msgs = await msgRes.json();

        console.log("Fetched conversation messages:", msgs);
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [actualConversationId, token]);

  // ---------------- SOCKET CONNECTION ----------------
  useEffect(() => {
    if (!token || !currentUserId || !actualConversationId) {
      console.log("Socket conditions not met:", { 
        token: !!token, 
        currentUserId, 
        actualConversationId 
      });
      return;
    }

    console.log("Creating socket connection with userId:", currentUserId);
    const s = io(backendUrl, {
      auth: { token: `Bearer ${token}` },
    });

    s.on("connect", () => {
      console.log("Socket connected! Socket ID:", s.id);
      s.emit("joinConversation", { conversationId: actualConversationId });
      console.log(`Emitted joinConversation for room: ${actualConversationId}`);
    });

    s.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    s.on("receiveMessage", (data) => {
      console.log("Received socket message:", data);
      console.log("Message senderId:", data.senderId, "Current userId:", currentUserId);

      if (data.senderId !== currentUserId) {
        console.log("Adding message from other user to UI");
        setMessages((prev) => [...prev, data]);
      } else {
        console.log("Skipping message from self (already in UI)");
      }
    });

    setSocket(s);

    return () => {
      console.log("Disconnecting socket");
      s.disconnect();
    };
  }, [token, currentUserId, actualConversationId]);

  // ---------------- POLLING FOR MESSAGES ----------------
  useEffect(() => {
    if (!actualConversationId || !token) {
      console.log("Skipping polling setup:", { actualConversationId, token: !!token });
      return;
    }

    console.log("Setting up polling for conversation:", actualConversationId);

    const pollForMessages = async () => {
      try {
        const msgRes = await fetch(`${backendUrl}/messages/${actualConversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const msgs = await msgRes.json();

        setMessages(msgs);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollingIntervalRef.current = setInterval(pollForMessages, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        console.log("Clearing polling interval");
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [actualConversationId, token]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- SEND MESSAGE ----------------
  const handleSend = () => {
    if (!newMessage.trim()) {
      console.log("Empty message, not sending");
      return;
    }
    
    if (!socket) {
      console.log("Socket not connected, not sending");
      return;
    }
    
    if (!actualConversationId) {
      console.log("No conversation ID, not sending");
      return;
    }

    const messageData = {
      conversationId: actualConversationId,
      receiverId: conversationId,
      content: newMessage,
      productId: productId || null,
    };

    console.log("Sending message via socket:", messageData);
    socket.emit("sendMessage", messageData);

    const optimisticMessage = {
      senderId: currentUserId,
      senderName: "You",
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <Header />

      <div className="flex-1 pt-20 pb-4 px-4 max-w-5xl mx-auto w-full flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4 flex items-center gap-4 shadow-lg">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            size="icon"
            className="hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg">
              {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-lg font-bold">
                {otherUser?.name || otherUser?.username}
              </h1>
              <p className="text-xs text-gray-400">
                {socket ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {groupedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <Send className="h-10 w-10 text-gray-600" />
                </div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              groupedMessages.map((item, i) => {
                if (item.type === 'date') {
                  return (
                    <div key={`date-${i}`} className="flex justify-center my-4">
                      <div className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-400">
                        {item.date}
                      </div>
                    </div>
                  );
                }

                const msg = item.data;
                const isMe = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg._id || i}
                    className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`group px-4 py-2 rounded-2xl max-w-[75%] break-words ${
                        isMe 
                          ? "bg-blue-600 text-white rounded-br-sm" 
                          : "bg-gray-700 text-white rounded-bl-sm"
                      }`}
                    >
                      {!isMe && (
                        <div className="text-xs font-semibold mb-1 text-blue-300">
                          {msg.senderName}
                        </div>
                      )}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      <div 
                        className={`text-xs mt-1 ${
                          isMe ? "text-blue-200" : "text-gray-400"
                        }`}
                        title={formatFullDate(msg.createdAt)}
                      >
                        {formatMessageDate(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4 bg-[#1a1a1a]">
            <div className="flex gap-2 items-end">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 p-3 bg-gray-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 min-h-[44px] max-h-32"
                placeholder="Type a message... (Shift + Enter for new line)"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '44px',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
              <button 
                onClick={handleSend} 
                className={`p-3 rounded-lg transition-all ${
                  !socket || !actualConversationId || !newMessage.trim()
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                disabled={!socket || !actualConversationId || !newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            
            {(!socket || !actualConversationId) && (
              <p className="text-xs text-gray-500 mt-2">
                Connecting to chat...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}