"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const demoUsers: Record<string, { password: string; role: string }> = {
        "treinador@cap.pt": { password: "123456", role: "treinador" },
        "secretaria@cap.pt": { password: "123456", role: "secretaria" },
        "encarregado@cap.pt": { password: "123456", role: "encarregado" },
        "atleta@cap.pt": { password: "123456", role: "atleta" },
        "gerencia@cap.pt": { password: "123456", role: "gerencia" },
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user = demoUsers[email.toLowerCase()]
      if (user && user.password === password) {
        localStorage.setItem("cap_user", JSON.stringify({ email, role: user.role }))
        router.push(`/dashboard/${user.role}`)
      } else {
        setError("Email ou password incorretos")
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/logo-cap.png"
              alt="CAP - Clube Amigos de Polvoreira"
              width={140}
              height={140}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Bem-vindo ao CAP</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Sistema de Gestao do Clube Amigos de Polvoreira
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@cap.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Introduza a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 mt-6" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  A entrar...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="size-4" />
                  Entrar
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Contas de demonstracao:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { email: "treinador@cap.pt", label: "Treinador" },
                { email: "secretaria@cap.pt", label: "Secretaria" },
                { email: "encarregado@cap.pt", label: "Encarregado" },
                { email: "atleta@cap.pt", label: "Atleta" },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => {
                    setEmail(demo.email)
                    setPassword("123456")
                  }}
                  className="p-2 text-left rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <span className="font-medium text-foreground">{demo.label}</span>
                  <span className="block text-muted-foreground truncate">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
