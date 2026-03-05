"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { signIn } from "next-auth/react";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As palavras-passe não coincidem",
  path: ["confirmPassword"],
});

type RegisterInput = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const validData = registerSchema.parse(formData);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validData.name,
          email: validData.email,
          password: validData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Erro ao registar");
        return;
      }

      // Auto-login after registration
      const signInResponse = await signIn("credentials", {
        email: validData.email,
        password: validData.password,
        redirect: false,
      });

      if (!signInResponse?.ok) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Erro ao registar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nome Completo
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="João Silva"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="seu@email.com"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Palavra-passe
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Confirmar Palavra-passe
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        {isLoading ? "Registando..." : "Registar"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Já tem conta?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-700">
          Fazer login
        </Link>
      </p>
    </form>
  );
}
