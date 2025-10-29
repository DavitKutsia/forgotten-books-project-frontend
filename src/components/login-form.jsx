import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({ className, ...props }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };
  const handleGoogleLogin = () => {
    window.location.href = `https://forgotten-books-project-backend.vercel.app/auth/google`;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://forgotten-books-project-backend.vercel.app/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        localStorage.setItem("token", data.token);

        console.log(data.user);
        setError("");
        navigate("/");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#121212]">
      <Card
        className=" text-xl bg-[#121212]  w-[400px] shadow-lg"
        style={{
          color: "rgba(255, 255, 255, 0.60)",
          border: "2px solid rgba(255, 255, 255, 0.60)",
          boxShadow: "0 4px 15px rgba(255, 255, 255, 0.28)",
        }}
        {...props}
      >
        <CardHeader>
          <CardTitle style={{ color: "rgba(255, 255, 255, 0.87)" }}>
            Welcome Back
          </CardTitle>
          <CardDescription style={{ color: "rgba(255, 255, 255, 0.60)" }}>
            Please login to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-[1.5px] border-[rgba(255,255,255,0.60)]"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-[1.5px] border-[rgba(255,255,255,0.60)]"
                />
              </Field>

              {error && (
                <FieldDescription className="text-red-500">
                  {error}
                </FieldDescription>
              )}

              <FieldGroup>
                <Field>
                  <Button
                    type="submit"
                    disabled={loading}
                    style={{
                      color: "rgba(255,255,255,0.60)",
                      cursor: "pointer",
                    }}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    style={{
                      color: "#121212",
                      backgroundColor: "rgba(255, 255, 255, 0.60)",
                      cursor: "pointer",
                      marginTop: "0.5rem",
                    }}
                    onClick={() => navigate("/signup")}
                  >
                    Sign up instead
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleGoogleLogin()}
                    style={{
                      color: "#121212",
                      backgroundColor: "rgba(255, 255, 255, 0.60)",
                      cursor: "pointer",
                      marginTop: "0.5rem",
                    }}
                  >
                    Continue with Google
                  </Button>
                  <FieldDescription
                    style={{ color: "rgba(255,255,255,0.60)" }}
                    className="text-center mt-2"
                  >
                    Forgot your password?{" "}
                    <span className="underline cursor-pointer">Reset here</span>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
