import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context";
import { ErrorMessage } from "../components/common";
import type { RegisterRequest } from "../types";

export function Register() {
  const [error, setError] = useState("");
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>();

  const onSubmit = async (data: RegisterRequest) => {
    setError("");
    try {
      await registerUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Email may already exist.");
    }
  };

  return (
    <div className="register-page">
      <h1>Register</h1>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
              maxLength: {
                value: 100,
                message: "Name must be less than 100 characters",
              },
            })}
          />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
          />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
