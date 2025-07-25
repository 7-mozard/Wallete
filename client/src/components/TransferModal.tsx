import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export function TransferModal({ isOpen, onClose, currentBalance }: TransferModalProps) {
  const [formData, setFormData] = useState({
    recipientEmail: "",
    amount: "",
    currency: "FC" as "FC" | "USD",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const transferMutation = useMutation({
    mutationFn: async (data: { recipientEmail: string; amount: number; currency: string }) => {
      const response = await apiRequest("POST", "/api/transfer", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transfert effectué",
        description: `Votre transfert de ${formData.amount} ${formData.currency} a été envoyé avec succès.`,
      });
      setFormData({ recipientEmail: "", amount: "", currency: "FC" });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de transfert",
        description: error.message || "Une erreur est survenue lors du transfert",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientEmail || !formData.amount) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant doit être positif",
        variant: "destructive",
      });
      return;
    }

    if (amount > currentBalance) {
      toast({
        title: "Erreur",
        description: "Solde insuffisant",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      recipientEmail: formData.recipientEmail,
      amount,
      currency: formData.currency,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transférer de l'argent</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipient">Email du destinataire</Label>
            <Input
              id="recipient"
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => handleChange("recipientEmail", e.target.value)}
              placeholder="destinataire@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Montant</Label>
            <div className="flex space-x-2">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0.00"
                className="flex-1"
                required
              />
              <Select
                value={formData.currency}
                onValueChange={(value: "FC" | "USD") => handleChange("currency", value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FC">FC</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Solde disponible:{" "}
              <span className="font-medium text-gray-900">{currentBalance.toFixed(2)} FC</span>
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={transferMutation.isPending}>
              {transferMutation.isPending ? "Envoi..." : "Transférer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
