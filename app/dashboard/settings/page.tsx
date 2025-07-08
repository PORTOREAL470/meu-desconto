"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { User, Mail, Phone, FileText, Lock, Save } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Form states
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [document, setDocument] = useState<string>("")
  const [userType, setUserType] = useState<string>("cliente")
  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  // Password states
  const [currentPassword, setCurrentPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false)

  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Obter perfil do usuário
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (error) throw error

        if (profileData) {
          setProfile(profileData)
          setName(profileData.name || "")
          setEmail(profileData.email || "")
          setPhone(profileData.phone || "")
          setDocument(profileData.document || "")
          setUserType(profileData.user_type || "cliente")
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      if (!name || !email) {
        throw new Error("Nome e e-mail são obrigatórios")
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error("Usuário não autenticado")

      // Atualizar perfil
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          email,
          phone,
          document,
          user_type: userType,
        })
        .eq("id", session.user.id)

      if (error) throw error

      // Atualizar e-mail no auth se necessário
      if (email !== profile.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email,
        })

        if (authError) throw authError
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })

      // Atualizar estado local
      setProfile({
        ...profile,
        name,
        email,
        phone,
        document,
        user_type: userType,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)

    try {
      if (!currentPassword) {
        throw new Error("A senha atual é obrigatória")
      }

      if (!newPassword) {
        throw new Error("A nova senha é obrigatória")
      }

      if (newPassword !== confirmPassword) {
        throw new Error("As senhas não coincidem")
      }

      if (newPassword.length < 6) {
        throw new Error("A nova senha deve ter pelo menos 6 caracteres")
      }

      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      })

      if (signInError) {
        throw new Error("Senha atual incorreta")
      }

      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      })

      // Limpar campos
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro ao alterar sua senha. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <p>Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      className="pl-8"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-8"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-8"
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="document">CPF ou CNPJ</Label>
                  <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="document"
                      className="pl-8"
                      placeholder="000.000.000-00 ou 00.000.000/0001-00"
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Tipo de Usuário</Label>
                  <RadioGroup value={userType} onValueChange={setUserType} className="flex space-x-2" disabled>
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
                  <p className="text-xs text-muted-foreground">
                    O tipo de usuário não pode ser alterado após o cadastro.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isUpdating}>
                  {isUpdating ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha para manter sua conta segura.</CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="current-password"
                      type="password"
                      className="pl-8"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      className="pl-8"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      className="pl-8"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>Alterando Senha...</>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" /> Alterar Senha
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

