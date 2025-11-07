import { useNavigate } from "react-router-dom";

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        backgroundColor: "#121212",
      }}
    >
      <h1>❌ Payment Cancelled</h1>
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "blue",
          color: "white",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Go Back Home
      </button>
    </div>
  );
}
