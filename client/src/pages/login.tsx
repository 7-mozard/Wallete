import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { Link } from "wouter";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoginLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans votre portefeuille Wallete!",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-blue-100">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Wallet className="text-2xl text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Wallete</h2>
            <p className="mt-2 text-sm text-gray-600">
              Connectez-vous à votre portefeuille électronique
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="text-center">
              <Link href="/register">
                <Button variant="link" className="text-sm">
                  Pas encore de compte ? S'inscrire
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
