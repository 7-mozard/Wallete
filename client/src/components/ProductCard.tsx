import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  stock: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
  onPurchase: (productId: string) => void;
  isPurchasing: boolean;
}

export function ProductCard({ product, onPurchase, isPurchasing }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-6xl">📦</div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {product.price} {product.currency}
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-500">En stock: {product.stock}</p>
              {isOutOfStock && <Badge variant="destructive">Rupture</Badge>}
            </div>
          </div>
          <Button
            onClick={() => onPurchase(product.id)}
            disabled={isPurchasing || isOutOfStock}
            className="ml-4"
          >
            {isPurchasing ? "Achat..." : "Acheter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
