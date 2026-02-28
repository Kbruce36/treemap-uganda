import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { sendMessage, TreeContext } from "@/services/geminiService";
import { useStatistics } from "@/hooks/use-statistics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bot,
  Send,
  Leaf,
  Bell,
  Trophy,
  Loader2,
  Map,
  User,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  role: "user" | "model";
  parts: string;
  timestamp: Date;
}

const CHAT_HISTORY_STORAGE_KEY = "greanbot_chat_history_v1";
const INITIAL_CHAT_MESSAGE: ChatMessage = {
  role: "model",
  parts:
    "Hello! 🌿 I'm GreenBot, your AI assistant for TreeMap UNAU Kyambogo. Ask me anything about trees, planting tips, or how to use this platform!",
  timestamp: new Date(),
};

interface Notification {
  id: string;
  type: "new_tree" | "milestone" | "info" | "advice";
  message: string;
  timestamp: Date;
  adviceData?: any;
}

interface NewTreePayload {
  species?: string;
  tree_count?: number;
}

const MAX_NOTIFICATIONS = 20;

const SUGGESTED_QUESTIONS = [
  "What tree species grow best in Uganda?",
  "How many trees have been planted so far?",
  "What are the benefits of planting Mvule trees?",
  "How do I care for a newly planted Mango tree?",
  "Which species are best for shade on campus?",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { totalTrees, activePlanters, treeSpecies, loading } = useStatistics();

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedAdvice, setSelectedAdvice] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const context: TreeContext = {
    totalTrees,
    activePlanters,
    treeSpecies,
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Array<{ role: "user" | "model"; parts: string; timestamp: string }>;
      if (!Array.isArray(parsed) || parsed.length === 0) return;

      const hydrated: ChatMessage[] = parsed
        .filter((item) => item?.role && typeof item.parts === "string")
        .map((item) => ({
          role: item.role,
          parts: item.parts,
          timestamp: new Date(item.timestamp),
        }));

      if (hydrated.length > 0) {
        setMessages(hydrated);
      }
    } catch (error) {
      console.warn("[Dashboard] Failed to load chat history from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.warn("[Dashboard] Failed to save chat history to localStorage:", error);
    }
  }, [messages]);

  // Seed initial notifications and subscribe to real-time tree events
  useEffect(() => {
    const seed: Notification[] = [
      {
        id: "info-1",
        type: "info",
        message: "Welcome to the TreeMap Dashboard! Start chatting with GreenBot or explore the map.",
        timestamp: new Date(),
      },
    ];

    // Add a milestone notification based on stats
    if (!loading && totalTrees > 0) {
      seed.push({
        id: "milestone-1",
        type: "milestone",
        message: `🎉 The community has planted ${totalTrees} tree${totalTrees !== 1 ? "s" : ""} so far!`,
        timestamp: new Date(),
      });
    }

    const loadExistingAdviceNotifications = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: adviceRows, error } = await (supabase as any)
        .from("tree_care_advice")
        .select("id, user_id, advice, created_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error || !adviceRows) {
        console.warn("[Dashboard] Failed to load existing advice notifications:", error);
        return;
      }

      const adviceNotifications: Notification[] = adviceRows.map((row: any) => ({
        id: `advice-existing-${row.id}`,
        type: "advice",
        message: "Bot: Your personalized survival advice is available.",
        timestamp: row.created_at ? new Date(row.created_at) : new Date(),
        adviceData: row.advice,
      }));

      setNotifications((prev) => {
        const merged = [...adviceNotifications, ...prev];
        const unique = merged.filter(
          (item, index, arr) => arr.findIndex((other) => other.id === item.id) === index
        );
        return unique.slice(0, MAX_NOTIFICATIONS);
      });
    };

    setNotifications(seed);
    loadExistingAdviceNotifications();

    // Real-time subscription for new trees and advice
    const channel = supabase
      .channel("dashboard_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trees" },
        (payload) => {
          const newTree = payload.new as NewTreePayload;
          const species = newTree.species || "a tree";
          const count = newTree.tree_count ?? 1;
          const notification: Notification = {
            id: `tree-${Date.now()}`,
            type: "new_tree",
            message: `🌱 Someone just planted ${count} ${species}${count > 1 ? "s" : ""}!`,
            timestamp: new Date(),
          };
          setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
          toast.success(notification.message);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tree_care_advice" },
        async (payload) => {
          console.log("[Dashboard Real-time] Detected new tree care advice in database:", payload.new);
          const { data: userData } = await supabase.auth.getUser();
          const adviceRow = payload.new as any;
          if (userData.user && adviceRow.user_id === userData.user.id) {
            console.log("[Dashboard Real-time] Advice belongs to current user. Processing notification popup.");
            const adviceData = adviceRow.advice ?? adviceRow.advice_json;
            const notification: Notification = {
              id: `advice-${adviceRow.id}`,
              type: "advice",
              message: `Bot: Your personalized survival advice for your new tree is ready.`,
              timestamp: new Date(),
              adviceData: adviceData
            };
            setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
            toast.info("New tree care advice available!");
          } else {
            console.log("[Dashboard Real-time] Advice belongs to a different user. Ignoring.");
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [totalTrees, loading]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = {
      role: "user",
      parts: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({ role: m.role, parts: m.parts }));
      const reply = await sendMessage(text, history, context);

      const botMessage: ChatMessage = {
        role: "model",
        parts: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      toast.error("Failed to get a response. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    if (type === "new_tree") return <Leaf className="w-4 h-4 text-green-600" />;
    if (type === "milestone") return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (type === "advice") return <Bot className="w-4 h-4 text-primary" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const getNotificationBadge = (type: Notification["type"]) => {
    if (type === "new_tree") return "default";
    if (type === "milestone") return "secondary";
    if (type === "advice") return "outline";
    return "outline";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Your hub for AI insights, notifications, and platform stats
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card
            className="shadow-card cursor-pointer hover:shadow-glow transition-all"
            onClick={() => navigate("/map")}
          >
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalTrees.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Trees Planted</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="shadow-card cursor-pointer hover:shadow-glow transition-all"
            onClick={() => navigate("/leaderboard")}
          >
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : activePlanters.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Active Planters</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="shadow-card cursor-pointer hover:shadow-glow transition-all"
            onClick={() => navigate("/map")}
          >
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <Map className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : treeSpecies.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Species Tracked</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Chat */}
          <Card className="lg:col-span-2 shadow-card flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 gradient-hero rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">GreenBot AI Assistant</CardTitle>
                  <CardDescription>Powered by Google Gemini</CardDescription>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="flex-1 flex flex-col pt-4 gap-4">
              {/* Messages */}
              <ScrollArea className="flex-1 h-[380px] pr-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.parts}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.role === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Suggested questions */}
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    disabled={isTyping}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50 text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask GreenBot anything..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  size="icon"
                  variant="default"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-card flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Notifications</CardTitle>
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {notifications.length}
                  </Badge>
                )}
              </div>
              <CardDescription>Real-time platform updates</CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="flex-1 pt-4">
              <ScrollArea className="h-[480px] pr-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                        <div
                        key={n.id}
                        className={`flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors flex-col ${n.type === 'advice' ? 'cursor-pointer border border-primary/20' : ''}`}
                        onClick={() => n.type === 'advice' && setSelectedAdvice(n.adviceData)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="mt-0.5 flex-shrink-0">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {n.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {n.type === "advice" && (
                              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                                Click to view full analysis <Leaf className="w-3 h-3" />
                              </p>
                            )}
                          </div>
                          <Badge variant={getNotificationBadge(n.type) as "default" | "secondary" | "outline"} className="text-xs flex-shrink-0">
                            {n.type === "new_tree" ? "New" : n.type === "milestone" ? "🏆" : n.type === "advice" ? "Advice" : "Info"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Advice Dialog */}
        <Dialog open={!!selectedAdvice} onOpenChange={(open) => !open && setSelectedAdvice(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Leaf className="w-5 h-5" />
                AI Tree Care Analysis
              </DialogTitle>
              <DialogDescription>
                Personalized survival and maintenance plan for your tree based on current Ugandan weather and location data.
              </DialogDescription>
            </DialogHeader>
            
            {selectedAdvice && (
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                    <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Leaf className="w-4 h-4" /> Recommended Species
                    </h4>
                    <p className="text-sm">{selectedAdvice.recommendedSpecies}</p>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Watering Plan
                    </h4>
                    <p className="text-sm">{selectedAdvice.wateringFrequency}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3 border-b pb-2">Immediate Survival Steps</h4>
                  <ul className="space-y-2">
                    {selectedAdvice.survivalAdvice?.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="pt-0.5">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3 border-b pb-2">Long-term Maintenance</h4>
                  <ul className="space-y-2">
                    {selectedAdvice.maintenanceTips?.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Leaf className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedAdvice.riskFactors?.length > 0 && (
                  <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                    <h4 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                      ⚠️ Environmental Risk Factors
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedAdvice.riskFactors.map((risk: string, i: number) => (
                        <li key={i} className="text-sm text-destructive/90">{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Dashboard;
