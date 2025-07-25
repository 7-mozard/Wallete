import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/Sidebar";
import { ProductCard } from "@/components/ProductCard";
import { apiRequest } from "@/lib/queryClient";

export default function ShopPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: wallet } = useQuery({
    queryKey: ["/api/wallet"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest("POST", `/api/products/${productId}/purchase`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Achat effectué",
        description: "Article ajouté à votre historique d'achats.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'achat",
        description: error.message || "Une erreur est survenue lors de l'achat",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (productId: string) => {
    purchaseMutation.mutate(productId);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar userRole="client" />
        <div className="lg:pl-64 flex flex-col flex-1">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Chargement des produits...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="client" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Boutique Wallete</h1>
              <p className="mt-2 text-gray-600">Achetez des articles avec votre solde électronique</p>
              {wallet && (
                <p className="mt-2 text-sm text-gray-500">
                  Solde disponible: <span className="font-medium text-primary">{wallet.balanceFC} FC</span>
                  {wallet.balanceUSD !== "0" && (
                    <span className="ml-2 font-medium text-primary">{wallet.balanceUSD} USD</span>
                  )}
                </p>
              )}
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        <SelectItem value="electronics">Électronique</SelectItem>
                        <SelectItem value="clothing">Vêtements</SelectItem>
                        <SelectItem value="home">Maison</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select defaultValue="price-asc">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-asc">Prix croissant</SelectItem>
                        <SelectItem value="price-desc">Prix décroissant</SelectItem>
                        <SelectItem value="name">Nom A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="search"
                      placeholder="Rechercher un produit..."
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-4xl">📦</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit disponible</h3>
                <p className="text-gray-500">La boutique sera bientôt approvisionnée.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPurchase={handlePurchase}
                    isPurchasing={purchaseMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
