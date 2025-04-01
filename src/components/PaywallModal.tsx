
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "communities" | "projects" | "interviews";
}

export default function PaywallModal({ isOpen, onClose, limitType }: PaywallModalProps) {
  const { startProSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const limitMessages = {
    communities: "You've reached your limit of 2 communities in the free tier.",
    projects: "You've reached your limit of 1 project in the free tier.",
    interviews: "You've reached your limit of 2 AI interviews in the free tier.",
  };

  const handleUpgrade = () => {
    setIsLoading(true);
    startProSubscription();
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Upgrade to Pro
            <Badge variant="default" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              Pro
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {limitMessages[limitType]}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg border p-4 mb-4">
            <h3 className="font-medium text-lg mb-2">Pro Plan - ₹1,738/month</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited communities</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>30 AI interviews per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpgrade} 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Upgrade Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
