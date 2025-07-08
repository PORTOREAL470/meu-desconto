"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Package, Plus, Pencil, Trash2, Search, X } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
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

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [userType, setUserType] = useState<string>("")
  const [userId, setUserId] = useState<string>("")

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [barcode, setBarcode] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUserData = async () => {
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
        let query = supabase.from("products").select("*").order("created_at", { ascending: false })

        // Se for varejo ou indústria, filtrar apenas os produtos criados pelo usuário
        if (profileData?.user_type !== "cliente") {
          query = query.eq("created_by", session.user.id)
        }

        const { data: productsData } = await query

        if (productsData) {
          setProducts(productsData)
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const productData = {
        name,
        description,
        barcode,
        price: Number.parseFloat(price),
        image_url: imageUrl,
        created_by: userId,
      }

      if (isEditing && currentProduct) {
        // Atualizar produto existente
        const { error } = await supabase.from("products").update(productData).eq("id", currentProduct.id)

        if (error) throw error

        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        })

        // Atualizar lista de produtos
        setProducts(products.map((p) => (p.id === currentProduct.id ? { ...p, ...productData } : p)))
      } else {
        // Criar novo produto
        const { data, error } = await supabase.from("products").insert([productData]).select()

        if (error) throw error

        toast({
          title: "Produto adicionado",
          description: "O produto foi adicionado com sucesso.",
        })

        // Atualizar lista de produtos
        setProducts([data[0], ...products])
      }

      // Limpar formulário e fechar diálogo
      resetForm()
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: isEditing ? "Erro ao atualizar produto" : "Erro ao adicionar produto",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      })

      // Atualizar lista de produtos
      setProducts(products.filter((p) => p.id !== productId))
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message || "Ocorreu um erro ao excluir o produto. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: any) => {
    setCurrentProduct(product)
    setName(product.name)
    setDescription(product.description || "")
    setBarcode(product.barcode || "")
    setPrice(product.price.toString())
    setImageUrl(product.image_url || "")
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setCurrentProduct(null)
    setName("")
    setDescription("")
    setBarcode("")
    setPrice("")
    setImageUrl("")
    setIsEditing(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
        {userType !== "cliente" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Edite as informações do produto abaixo."
                    : "Preencha as informações do novo produto abaixo."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEdit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      placeholder="Nome do produto"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descrição do produto"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="barcode">Código de Barras</Label>
                      <Input
                        id="barcode"
                        placeholder="Código de barras"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Preço</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0,00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image">URL da Imagem</Label>
                    <Input
                      id="image"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Adicionar Produto"}
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
            placeholder="Buscar produtos..."
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
          <p>Carregando produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm
              ? "Tente buscar com outros termos ou limpe a busca."
              : userType !== "cliente"
                ? "Clique em 'Adicionar Produto' para começar."
                : "Não há produtos disponíveis no momento."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">{product.description || "Sem descrição"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-muted">
                  {product.image_url ? (
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Preço</p>
                    <p className="font-medium">{formatCurrency(product.price)}</p>
                  </div>
                  {product.barcode && (
                    <div>
                      <p className="text-muted-foreground">Código</p>
                      <p className="font-medium">{product.barcode}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              {userType !== "cliente" && (
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
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
                        <AlertDialogTitle>Excluir produto</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDelete(product.id)}
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

