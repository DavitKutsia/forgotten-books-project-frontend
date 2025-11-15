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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SignupForm({ role, ...props }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [signupSuccess, setSignUpSuccess] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: role,
  });

  const handleGoogleLogin = (userRole) => {
    window.location.href = `https://forgotten-books-project-backend.vercel.app/auth/google?role=${userRole}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(
        `https://forgotten-books-project-backend.vercel.app/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data1 = await res.json();
      console.log(formData);
      setData(data1);
      if (!res.ok) {
        setErrors({ message: data1.message || "Signup failed" });
        setLoading(false);
      } else {
        setSignUpSuccess(true);
      }
    } catch (error) {
      console.error(error.message);
      setSignUpSuccess(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#121212]">
      {!signupSuccess && loading && (
        <div className="mb-4 text-blue-500">Loading...</div>
      )}
      {errors && <div className="mb-4 text-red-500">{errors.message}</div>}
      {!signupSuccess && (
        <div className="w-full flex justify-center items-center">
          <Card
            className=" text-xl bg-[#121212] w-[300px] sm:w-[400px] md:w-[500px] shadow-lg"
            {...props}
            style={{
              color: "rgba(255, 255, 255, 0.60)",
              border: "2px solid rgba(255, 255, 255, 0.60)",
              boxShadow: "0 4px 15px rgba(255, 255, 255, 0.28)",
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: "rgba(255, 255, 255, 0.87)" }}>
                {role === "admin"
                  ? "Create an admin account to manage the platform"
                  : "Join our community and start exploring"}{" "}
                <span
                  className={`text-2xl  ${
                    role === "admin" ? "text-[#FF4444]" : "text-[#4169E1]"
                  } `}
                >
                  {role === "admin" ? "Admin" : "User"}
                </span>
              </CardTitle>
              <CardDescription style={{ color: "	rgba(255, 255, 255, 0.60)" }}>
                {role === "admin"
                  ? "Admin accounts have full platform management capabilities"
                  : "We just need some information to get you started :)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                style={{ color: "	rgba(255, 255, 255, 0.60)" }}
                onSubmit={handleSubmit}
              >
                <FieldGroup>
                  <Field className=" text-xl">
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      className="border-[1.5px] border-[rgba(255,255,255,0.60)]"
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="m@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-[1.5px] border-[rgba(255,255,255,0.60)] "
                    />
                    <FieldDescription
                      style={{ color: "	rgba(255, 255, 255, 0.60)" }}
                    >
                      We&apos;ll use this to contact you. We will not share your
                      email with anyone else.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      className="border-[1.5px] border-[rgba(255,255,255,0.60)] "
                      id="password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <FieldDescription
                      style={{ color: "	rgba(255, 255, 255, 0.60)" }}
                    >
                      Must be at least 8 characters long.
                    </FieldDescription>
                  </Field>

                  <FieldGroup>
                    <Field>
                      <Button
                        style={{
                          color: "	rgba(255, 255, 255, 0.60)",
                          cursor: "pointer",
                        }}
                        type="submit"
                      >
                        Create Account
                      </Button>
                      <Button
                        onClick={() =>
                          handleGoogleLogin(
                            role === "admin" ? "admin" : "user"
                          )
                        }
                        style={{
                          color: "#121212",
                          backgroundColor: "rgba(255, 255, 255, 0.60)",
                        }}
                        className="cursor-pointer border-[#121212]"
                        variant="outline"
                        type="button"
                      >
                        Sign up with Google
                      </Button>
                      <FieldDescription
                        style={{ color: "	rgba(255, 255, 255, 0.60)" }}
                        className="px-6 text-center "
                      >
                        Already have an account?{" "}
                        <span
                          onClick={() => navigate("/Signin")}
                          className="underline cursor-pointer"
                        >
                          Sign In
                        </span>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      )}{" "}
      {signupSuccess && (
        <Card
          className="text-center p-8 bg-[#121212] w-[400px] shadow-lg"
          style={{
            color: "rgba(255,255,255,0.87)",
            border: "2px solid rgba(255,255,255,0.60)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-2xl text-green-400">
              Account Created Successfully 🎉
            </CardTitle>
            <CardDescription className="text-gray-400">
              You can now sign in with your new account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="mt-4" onClick={() => navigate("/Signin")}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}