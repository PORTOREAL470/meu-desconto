"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ShoppingBag, Plus, Search, X, FileText, Check, AlertCircle } from "lucide-react"

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
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PurchasesPage() {
  const [receipts, setReceipts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [userId, setUserId] = useState<string>("")

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [receiptNumber, setReceiptNumber] = useState<string>("")
  const [receiptDate, setReceiptDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [totalAmount, setTotalAmount] = useState<string>("")
  const [storeId, setStoreId] = useState<string>("")
  const [stores, setStores] = useState<any[]>([])
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
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

        setUserId(session.user.id)

        // Obter lojas
        const { data: storesData } = await supabase.from("stores").select("*").order("name")

        if (storesData) {
          setStores(storesData)
        }

        // Obter notas fiscais
        const { data: receiptsData } = await supabase
          .from("receipts")
          .select(`
            *,
            stores:store_id (name)
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (receiptsData) {
          setReceipts(receiptsData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const filteredReceipts = receipts.filter((receipt) => {
    const receiptNum = receipt.receipt_number || ""
    const storeName = receipt.stores?.name || ""

    return (
      receiptNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storeName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!receiptNumber || !receiptDate || !totalAmount || !storeId) {
        throw new Error("Preencha todos os campos obrigatórios")
      }

      let imageUrl = null

      // Upload da imagem se existir
      if (receiptImage) {
        const fileExt = receiptImage.name.split(".").pop()
        const fileName = `${userId}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(fileName, receiptImage)

        if (uploadError) throw uploadError

        // Obter URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("receipts").getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      // Criar nota fiscal
      const receiptData = {
        user_id: userId,
        store_id: storeId,
        receipt_number: receiptNumber,
        receipt_date: new Date(receiptDate).toISOString(),
        total_amount: Number.parseFloat(totalAmount),
        image_url: imageUrl,
        status: "pending",
      }

      const { data, error } = await supabase
        .from("receipts")
        .insert([receiptData])
        .select(`
          *,
          stores:store_id (name)
        `)

      if (error) throw error

      toast({
        title: "Nota fiscal enviada",
        description: "Sua nota fiscal foi enviada com sucesso e está em análise.",
      })

      // Atualizar lista de notas fiscais
      setReceipts([data[0], ...receipts])

      // Limpar formulário e fechar diálogo
      resetForm()
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erro ao enviar nota fiscal",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setReceiptNumber("")
    setReceiptDate(new Date().toISOString().split("T")[0])
    setTotalAmount("")
    setStoreId("")
    setReceiptImage(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <div className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            <Check className="h-3 w-3 mr-1" />
            Aprovada
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejeitada
          </div>
        )
      default:
        return (
          <div className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Em análise
          </div>
        )
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Minhas Compras</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Nota Fiscal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nota Fiscal</DialogTitle>
              <DialogDescription>Preencha os dados da sua nota fiscal para receber cashback.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="receipt_number">Número da Nota Fiscal</Label>
                  <Input
                    id="receipt_number"
                    placeholder="Ex: NF-123456"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store">Supermercado</Label>
                  <select
                    id="store"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    required
                  >
                    <option value="">Selecione um supermercado</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="receipt_date">Data da Compra</Label>
                    <Input
                      id="receipt_date"
                      type="date"
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="total_amount">Valor Total</Label>
                    <Input
                      id="total_amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0,00"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="receipt_image">Imagem da Nota Fiscal</Label>
                  <Input
                    id="receipt_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setReceiptImage(e.target.files[0])
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Envie uma foto clara da sua nota fiscal para agilizar a análise.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar Nota Fiscal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar notas fiscais..."
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
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Em Análise</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
        </TabsList>

        {["all", "pending", "approved", "rejected"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p>Carregando notas fiscais...</p>
              </div>
            ) : filteredReceipts.filter((r) => tab === "all" || r.status === tab).length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhuma nota fiscal encontrada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm
                    ? "Tente buscar com outros termos ou limpe a busca."
                    : "Clique em 'Cadastrar Nota Fiscal' para começar a receber cashback."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredReceipts
                  .filter((r) => tab === "all" || r.status === tab)
                  .map((receipt) => (
                    <Card key={receipt.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{receipt.receipt_number}</CardTitle>
                            <CardDescription>{receipt.stores?.name || "Supermercado"}</CardDescription>
                          </div>
                          {getStatusBadge(receipt.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col p-3 bg-muted rounded-lg">
                            <span className="text-xs text-muted-foreground">Data</span>
                            <span className="text-sm font-medium">{formatDate(receipt.receipt_date)}</span>
                          </div>
                          <div className="flex flex-col p-3 bg-muted rounded-lg">
                            <span className="text-xs text-muted-foreground">Valor</span>
                            <span className="text-sm font-medium">{formatCurrency(receipt.total_amount)}</span>
                          </div>
                        </div>
                        {receipt.image_url && (
                          <div className="mt-2">
                            <a
                              href={receipt.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Ver imagem da nota fiscal
                            </a>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="text-sm text-muted-foreground">
                          Cadastrada em {formatDate(receipt.created_at)}
                        </div>
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

