
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { UserSubscription, UserUsage } from "@/lib/supabase-types";

export type SubscriptionTier = "free" | "pro";

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  usage: UserUsage | null;
  isLoading: boolean;
  isPro: boolean;
  hasReachedLimit: (limitType: "communities" | "projects" | "interviews") => boolean;
  refreshSubscription: () => Promise<void>;
  startProSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptionData = async () => {
    if (!user) {
      setSubscription(null);
      setUsage(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subscriptionError) {
        console.error("Error fetching subscription:", subscriptionError);
      } else {
        setSubscription(subscriptionData as unknown as UserSubscription);
      }

      // Fetch usage data
      const { data: usageData, error: usageError } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (usageError) {
        console.error("Error fetching usage:", usageError);
      } else {
        setUsage(usageData as unknown as UserUsage);
      }
    } catch (error) {
      console.error("Error in subscription data fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();

    // Set up realtime subscription to track changes
    if (user) {
      const subscriptionChannel = supabase
        .channel("subscription-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_subscriptions",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchSubscriptionData();
          }
        )
        .subscribe();

      const usageChannel = supabase
        .channel("usage-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_usage",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchSubscriptionData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscriptionChannel);
        supabase.removeChannel(usageChannel);
      };
    }
  }, [user]);

  const isPro = Boolean(
    subscription?.plan_type === "pro" &&
      (!subscription.expires_at || new Date(subscription.expires_at) > new Date())
  );

  const hasReachedLimit = (limitType: "communities" | "projects" | "interviews") => {
    if (isPro || !usage) return false;

    switch (limitType) {
      case "communities":
        return usage.communities_joined >= 2;
      case "projects":
        return usage.projects_created >= 1;
      case "interviews":
        return usage.interviews_used >= 2;
      default:
        return false;
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscriptionData();
  };

  const startProSubscription = () => {
    // Update the Razorpay payment link
    const razorpayLink = "https://razorpay.me/@madxmas";
    window.open(razorpayLink, "_blank");
    
    toast.info(
      "After completing payment, your Pro subscription will be activated. It may take a few moments to update.",
      {
        duration: 8000,
      }
    );
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        usage,
        isLoading,
        isPro,
        hasReachedLimit,
        refreshSubscription,
        startProSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export type { UserSubscription as SubscriptionData, UserUsage };
