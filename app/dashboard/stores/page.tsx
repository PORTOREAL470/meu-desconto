"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Store, Search, X, MapPin, Phone, Mail } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([])
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

        // Verificar se é indústria
        if (profileData?.user_type !== "industria") {
          toast({
            title: "Acesso restrito",
            description: "Esta página é exclusiva para usuários do tipo indústria.",
            variant: "destructive",
          })
          return
        }

        // Obter lojas
        const { data: storesData } = await supabase
          .from("stores")
          .select(`
            *,
            profiles:owner_id (name, email, phone)
          `)
          .order("name")

        if (storesData) {
          setStores(storesData)
        }
      } catch (error) {
        console.error("Erro ao carregar lojas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  const filteredStores = stores.filter((store) => {
    const storeName = store.name || ""
    const storeDocument = store.document || ""
    const storeAddress = store.address || ""

    return (
      storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storeDocument.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storeAddress.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (userType !== "industria") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Store className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Acesso Restrito</h3>
        <p className="text-sm text-muted-foreground mt-1">Esta página é exclusiva para usuários do tipo indústria.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Lojas Parceiras</h2>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar lojas..."
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

      {isLoading ? (
        <div className="flex justify-center p-8">
          <p>Carregando lojas...</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Store className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma loja encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm
              ? "Tente buscar com outros termos ou limpe a busca."
              : "Não há lojas parceiras cadastradas no momento."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => (
            <Card key={store.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{store.name}</CardTitle>
                <CardDescription>CNPJ: {store.document}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm">{store.address || "Endereço não informado"}</p>
                </div>
                {store.profiles?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm">{store.profiles.phone}</p>
                  </div>
                )}
                {store.profiles?.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm">{store.profiles.email}</p>
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
                      description: "A criação de promoções para esta loja estará disponível em breve.",
                    })
                  }}
                >
                  Criar Promoção
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

