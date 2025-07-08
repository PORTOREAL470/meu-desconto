"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Eye, EyeOff, Github } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SignupPage() {
  const searchParams = useSearchParams()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [document, setDocument] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("cliente")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Preencher campos com parâmetros da URL, se disponíveis
    const nameParam = searchParams.get("name")
    const emailParam = searchParams.get("email")
    const typeParam = searchParams.get("type")

    if (nameParam) setName(nameParam)
    if (emailParam) setEmail(emailParam)
    if (typeParam) setUserType(typeParam)
  }, [searchParams])

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            user_type: userType,
          },
        },
      })

      if (authError) throw authError

      // Criar perfil na tabela profiles
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            name,
            email,
            phone,
            document,
            user_type: userType,
          },
        ])

        if (profileError) throw profileError
      }

      toast({
        title: "Cadastro realizado com sucesso",
        description: "Verifique seu e-mail para confirmar sua conta.",
      })

      router.push("/auth/verify")
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao tentar criar sua conta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = async (provider: "github") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao tentar criar sua conta. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold">
              <span className="text-yellow-500">Meu</span>
              <span className="text-purple-600">Desconto</span>
            </h1>
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight">Crie sua conta</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ou{" "}
            <Link href="/auth/login" className="font-medium text-purple-600 hover:text-purple-500">
              entre com uma conta existente
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <Button
            onClick={() => handleSocialSignup("github")}
            className="w-full bg-gray-900 hover:bg-gray-800"
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            Continuar com Github
          </Button>
          <div className="flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-sm text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="document">CPF ou CNPJ</Label>
              <Input
                id="document"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label>Tipo de usuário</Label>
              <RadioGroup value={userType} onValueChange={setUserType} className="flex space-x-2" disabled={isLoading}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cliente" id="cliente" />
                  <Label htmlFor="cliente">Cliente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="varejo" id="varejo" />
                  <Label htmlFor="varejo">Varejo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="industria" id="industria" />
                  <Label htmlFor="industria">Indústria</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

