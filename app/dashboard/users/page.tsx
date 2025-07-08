"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Users, Search, X, Mail, Phone, FileText, ShoppingBag } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [userType, setUserType] = useState<string>("")

  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Obter tipo de usuário
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single()

        if (profileData) {
          setUserType(profileData.user_type)
        }

        // Verificar se é varejo ou indústria
        if (profileData?.user_type !== "varejo" && profileData?.user_type !== "industria") {
          toast({
            title: "Acesso restrito",
            description: "Esta página é exclusiva para usuários do tipo varejo ou indústria.",
            variant: "destructive",
          })
          return
        }

        // Obter usuários do tipo cliente
        const { data: usersData } = await supabase.from("profiles").select("*").eq("user_type", "cliente").order("name")

        if (usersData) {
          setUsers(usersData)
        }
      } catch (error) {
        console.error("Erro ao carregar usuários:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  const filteredUsers = users.filter((user) => {
    const userName = user.name || ""
    const userEmail = user.email || ""
    const userPhone = user.phone || ""
    const userDocument = user.document || ""

    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userDocument.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (userType !== "varejo" && userType !== "industria") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Acesso Restrito</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Esta página é exclusiva para usuários do tipo varejo ou indústria.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar usuários..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpar</span>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Clientes</TabsTrigger>
          <TabsTrigger value="active">Clientes Ativos</TabsTrigger>
        </TabsList>

        {["all", "active"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p>Carregando usuários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum usuário encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm
                    ? "Tente buscar com outros termos ou limpe a busca."
                    : "Não há usuários cadastrados no momento."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>
                        Cliente desde {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="text-sm">{user.email}</p>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="text-sm">{user.phone}</p>
                        </div>
                      )}
                      {user.document && (
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="text-sm">CPF: {user.document}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Funcionalidade em desenvolvimento",
                            description: "A visualização de compras deste cliente estará disponível em breve.",
                          })
                        }}
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Ver Compras
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

