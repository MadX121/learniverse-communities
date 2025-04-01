
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export default function Subscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    subscription, 
    usage, 
    isPro, 
    isLoading, 
    startProSubscription 
  } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = () => {
    setIsUpgrading(true);
    startProSubscription();
    // Reset button state after a short delay
    setTimeout(() => {
      setIsUpgrading(false);
    }, 1000);
  };

  return (
    <PageLayout>
      {!user ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in to manage your subscription</h2>
            <p className="mb-6 text-muted-foreground">
              You need to be signed in to view and manage your subscription.
            </p>
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <CreditCard className="h-8 w-8" />
                Subscription
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your subscription and usage
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Plan */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Plan</span>
                  {isPro ? (
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500">Pro</Badge>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isPro 
                    ? "You are currently on the Pro plan with unlimited access to all features."
                    : "You are currently on the Free plan with limited access to features."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Plan Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Plan</p>
                          <p className="font-medium">{subscription?.plan_type === "pro" ? "Pro" : "Free"}</p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-1">Started</p>
                          <p className="font-medium">
                            {subscription?.starts_at 
                              ? new Date(subscription.starts_at).toLocaleDateString() 
                              : "N/A"}
                          </p>
                        </div>
                        {isPro && subscription?.expires_at && (
                          <div className="border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">Expires</p>
                            <p className="font-medium">
                              {new Date(subscription.expires_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {isPro && subscription?.payment_id && (
                          <div className="border rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">Payment ID</p>
                            <p className="font-medium truncate">{subscription.payment_id}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!isPro && (
                      <div>
                        <h3 className="font-medium mb-2">Usage Limits</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Communities</span>
                              <span className="text-sm font-medium">{usage?.communities_joined || 0}/2</span>
                            </div>
                            <Progress value={(usage?.communities_joined || 0) * 50} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Projects</span>
                              <span className="text-sm font-medium">{usage?.projects_created || 0}/1</span>
                            </div>
                            <Progress value={(usage?.projects_created || 0) * 100} />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">AI Interviews</span>
                              <span className="text-sm font-medium">{usage?.interviews_used || 0}/2</span>
                            </div>
                            <Progress value={(usage?.interviews_used || 0) * 50} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              {!isPro && (
                <CardFooter>
                  <Button 
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Upgrade to Pro</>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Plan Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Comparison</CardTitle>
                <CardDescription>Compare Free and Pro plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Free</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>2 communities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>1 project</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>2 AI interviews per month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Basic analytics</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Pro - ₹1,738/month</h3>
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
              </CardContent>
              {!isPro && (
                <CardFooter>
                  <Button 
                    onClick={handleUpgrade}
                    className="w-full"
                    variant="outline"
                    disabled={isUpgrading}
                  >
                    Get Pro
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
