import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (!token) return;

    localStorage.setItem("token", token);

    if (role) {
      localStorage.setItem("userRole", role);
    }

    fetch(`${backendUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const user = data.user;

        localStorage.setItem("userId", user.id || user._id);

        if (user.role === "admin") navigate("/adminpanel");
        else navigate("/");
      })
      .catch(err => console.error("Profile fetch error:", err));
  }, [searchParams, navigate, backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleGoogleLogin = (userRole) => {
    window.location.href = `${backendUrl}/auth/google?role=${userRole}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${backendUrl}/auth/login`,
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

        try {
          const profileRes = await fetch(
            `${backendUrl}/auth/profile`,
            {
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            }
          );

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            const user = profileData.user;
            
            localStorage.setItem('userId', user.id || user._id);
            localStorage.setItem('userRole', user.role);
            
            if (user.role === 'admin') {
              navigate('/adminpanel');
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
        } catch (profileErr) {
          console.error('Profile fetch error:', profileErr);
          navigate('/');
        }

        setError("");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[#121212]">
      <Card
        className="text-xl bg-[#121212] mt-[10%]  w-[400px] shadow-lg"
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

                  <div className="mt-4 space-y-2">
                    <div className="text-center text-sm" style={{ color: "rgba(255, 255, 255, 0.60)" }}>
                      Continue with Google:
                    </div>   
                  </div>  

                  <FieldDescription
                    style={{ color: "rgba(255,255,255,0.60)" }}
                    className="text-center mt-4"
                  >
                    Forgot your password?{" "}
                    <span className="underline cursor-pointer" onClick={() => navigate("/Signup")}>Reset here</span>
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
