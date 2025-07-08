"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tag, Plus, Pencil, Trash2, Search, X, Calendar, DollarSign } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [industries, setIndustries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [userType, setUserType] = useState<string>("")
  const [userId, setUserId] = useState<string>("")

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [currentPromotion, setCurrentPromotion] = useState<any>(null)
  const [productId, setProductId] = useState<string>("")
  const [storeId, setStoreId] = useState<string>("")
  const [industryId, setIndustryId] = useState<string>("")
  const [cashbackPercentage, setCashbackPercentage] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // +30 dias
  const [maxCashbackAmount, setMaxCashbackAmount] = useState<string>("")
  const [maxUsers, setMaxUsers] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        // Obter tipo de usuário e ID
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single()

        if (profileData) {
          setUserType(profileData.user_type)
          setUserId(session.user.id)
        }

        // Obter produtos
        const { data: productsData } = await supabase.from("products").select("*").order("name")

        if (productsData) {
          setProducts(productsData)
        }

        // Obter lojas se for indústria
        if (profileData?.user_type === "industria") {
          const { data: storesData } = await supabase.from("stores").select("*").order("name")

          if (storesData) {
            setStores(storesData)
          }
        }

        // Obter indústrias se for varejo
        if (profileData?.user_type === "varejo") {
          const { data: industriesData } = await supabase.from("industries").select("*").order("name")

          if (industriesData) {
            setIndustries(industriesData)
          }
        }

        // Obter promoções
        let query = supabase
          .from("promotions")
          .select(`
            *,
            products:product_id (name),
            stores:store_id (name),
            industries:industry_id (name)
          `)
          .order("created_at", { ascending: false })

        // Filtrar promoções de acordo com o tipo de usuário
        if (profileData?.user_type === "varejo") {
          query = query.eq("store_id", session.user.id)
        } else if (profileData?.user_type === "industria") {
          query = query.eq("industry_id", session.user.id)
        }

        const { data: promotionsData } = await query

        if (promotionsData) {
          setPromotions(promotionsData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const filteredPromotions = promotions.filter((promotion) => {
    const productName = promotion.products?.name || ""
    const storeName = promotion.stores?.name || ""
    const industryName = promotion.industries?.name || ""

    return (
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      industryName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!productId) {
        throw new Error("Selecione um produto")
      }

      if (!startDate || !endDate) {
        throw new Error("Selecione as datas de início e fim")
      }

      if (new Date(endDate) <= new Date(startDate)) {
        throw new Error("A data de término deve ser posterior à data de início")
      }

      const promotionData = {
        product_id: productId,
        store_id: userType === "varejo" ? userId : null,
        industry_id: userType === "industria" ? userId : null,
        cashback_percentage: Number.parseFloat(cashbackPercentage),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        max_cashback_amount: maxCashbackAmount ? Number.parseFloat(maxCashbackAmount) : null,
        max_users: maxUsers ? Number.parseInt(maxUsers) : null,
      }

      if (isEditing && currentPromotion) {
        // Atualizar promoção existente
        const { error } = await supabase.from("promotions").update(promotionData).eq("id", currentPromotion.id)

        if (error) throw error

        toast({
          title: "Promoção atualizada",
          description: "A promoção foi atualizada com sucesso.",
        })

        // Atualizar lista de promoções
        const updatedPromotion = {
          ...currentPromotion,
          ...promotionData,
          products: products.find((p) => p.id === productId),
        }

        setPromotions(promotions.map((p) => (p.id === currentPromotion.id ? updatedPromotion : p)))
      } else {
        // Criar nova promoção
        const { data, error } = await supabase
          .from("promotions")
          .insert([promotionData])
          .select(`
            *,
            products:product_id (name),
            stores:store_id (name),
            industries:industry_id (name)
          `)

        if (error) throw error

        toast({
          title: "Promoção adicionada",
          description: "A promoção foi adicionada com sucesso.",
        })

        // Atualizar lista de promoções
        setPromotions([data[0], ...promotions])
      }

      // Limpar formulário e fechar diálogo
      resetForm()
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: isEditing ? "Erro ao atualizar promoção" : "Erro ao adicionar promoção",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (promotionId: string) => {
    try {
      const { error } = await supabase.from("promotions").delete().eq("id", promotionId)

      if (error) throw error

      toast({
        title: "Promoção excluída",
        description: "A promoção foi excluída com sucesso.",
      })

      // Atualizar lista de promoções
      setPromotions(promotions.filter((p) => p.id !== promotionId))
    } catch (error: any) {
      toast({
        title: "Erro ao excluir promoção",
        description: error.message || "Ocorreu um erro ao excluir a promoção. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (promotion: any) => {
    setCurrentPromotion(promotion)
    setProductId(promotion.product_id)
    setStoreId(promotion.store_id || "")
    setIndustryId(promotion.industry_id || "")
    setCashbackPercentage(promotion.cashback_percentage.toString())
    setStartDate(new Date(promotion.start_date))
    setEndDate(new Date(promotion.end_date))
    setMaxCashbackAmount(promotion.max_cashback_amount?.toString() || "")
    setMaxUsers(promotion.max_users?.toString() || "")
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setCurrentPromotion(null)
    setProductId("")
    setStoreId("")
    setIndustryId("")
    setCashbackPercentage("")
    setStartDate(new Date())
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    setMaxCashbackAmount("")
    setMaxUsers("")
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
  }

  const isPromotionActive = (startDate: string, endDate: string) => {
    const now = new Date()
    return new Date(startDate) <= now && now <= new Date(endDate)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Promoções</h2>
        {(userType === "varejo" || userType === "industria") && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Promoção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Promoção" : "Adicionar Promoção"}</DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Edite as informações da promoção abaixo."
                    : "Preencha as informações da nova promoção abaixo."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEdit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product">Produto</Label>
                    <Select value={productId} onValueChange={setProductId} required>
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cashback">Percentual de Cashback (%)</Label>
                    <Input
                      id="cashback"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="100"
                      placeholder="10.00"
                      value={cashbackPercentage}
                      onChange={(e) => setCashbackPercentage(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Data de Início</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <Calendar className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label>Data de Término</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <Calendar className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="maxAmount">Valor Máximo de Cashback (R$)</Label>
                      <Input
                        id="maxAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="5.00"
                        value={maxCashbackAmount}
                        onChange={(e) => setMaxCashbackAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="maxUsers">Número Máximo de Usuários</Label>
                      <Input
                        id="maxUsers"
                        type="number"
                        min="1"
                        placeholder="100"
                        value={maxUsers}
                        onChange={(e) => setMaxUsers(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Adicionar Promoção"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar promoções..."
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
          <p>Carregando promoções...</p>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhuma promoção encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm
              ? "Tente buscar com outros termos ou limpe a busca."
              : userType !== "cliente"
                ? "Clique em 'Adicionar Promoção' para começar."
                : "Não há promoções disponíveis no momento."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPromotions.map((promotion) => (
            <Card key={promotion.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{promotion.products?.name}</CardTitle>
                    <CardDescription>{promotion.stores?.name || promotion.industries?.name}</CardDescription>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isPromotionActive(promotion.start_date, promotion.end_date)
                        ? "bg-green-100 text-green-800"
                        : new Date(promotion.start_date) > new Date()
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isPromotionActive(promotion.start_date, promotion.end_date)
                      ? "Ativa"
                      : new Date(promotion.start_date) > new Date()
                        ? "Futura"
                        : "Encerrada"}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                    <DollarSign className="h-5 w-5 text-yellow-500 mb-1" />
                    <span className="text-xl font-bold">{promotion.cashback_percentage}%</span>
                    <span className="text-xs text-muted-foreground">Cashback</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-500 mb-1" />
                    <span className="text-sm font-medium">{formatDate(promotion.end_date)}</span>
                    <span className="text-xs text-muted-foreground">Validade</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {promotion.max_cashback_amount && (
                    <div>
                      <p className="text-muted-foreground">Valor máximo</p>
                      <p className="font-medium">R$ {promotion.max_cashback_amount.toFixed(2)}</p>
                    </div>
                  )}
                  {promotion.max_users && (
                    <div>
                      <p className="text-muted-foreground">Limite de usuários</p>
                      <p className="font-medium">{promotion.max_users}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              {(userType === "varejo" || userType === "industria") && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(promotion)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir promoção</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta promoção? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDelete(promotion.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

