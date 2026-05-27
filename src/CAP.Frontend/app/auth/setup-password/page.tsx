"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { CheckCircle2, AlertCircle, Loader2, Lock, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { fetchApi } from "@/lib/api"

function SetupPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<{ nome: string, email: string } | null>(null)
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Token de convite não encontrado.")
      setLoading(false)
      return
    }

    const validateToken = async () => {
      try {
        const data = await fetchApi<any>(`api/users/auth/invitation/validate?token=${token}`)
        setUserData(data)
      } catch (e: any) {
        setError(e.message || "O convite é inválido ou já expirou.")
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("As palavras-passe não coincidem.")
      return
    }

    setSubmitting(true)
    try {
      await fetchApi("api/users/auth/invitation/setup", {
        method: "POST",
        body: JSON.stringify({ token, password })
      })
      setSuccess(true)
    } catch (e: any) {
      alert(e.message || "Erro ao configurar palavra-passe.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">A validar o seu convite...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Convite Inválido</h2>
        <p className="text-muted-foreground max-w-sm mb-8">{error}</p>
        <Button onClick={() => router.push("/")}>Voltar ao Início</Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="size-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Tudo pronto!</h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          A sua palavra-passe foi configurada com sucesso. Já pode aceder ao seu dashboard.
        </p>
        <Button className="w-full max-w-xs" onClick={() => router.push("/")}>Iniciar Sessão</Button>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto p-4 py-12">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Image src="/images/logo-cap.png" alt="CAP" width={80} height={80} className="object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-cap-navy">Bem-vindo ao CAP</h1>
        <p className="text-muted-foreground mt-2">Configure a sua palavra-passe para ativar a conta.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Olá, {userData?.nome}</CardTitle>
          <CardDescription>Email: {userData?.email}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSetup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Palavra-passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  A processar...
                </>
              ) : (
                <>
                  <Lock className="size-4 mr-2" />
                  Ativar Conta
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" /></div>}>
        <SetupPasswordContent />
      </Suspense>
    </div>
  )
}
