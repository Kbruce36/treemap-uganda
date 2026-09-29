import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { supabase } from "@/integrations/supabase/client";
import { clearGreenBotHistory } from "@/services/geminiService";

// However someone signs out (menu, admin panel, expired session), wipe their
// GreenBot conversation from this device so the next person can't read it.
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") clearGreenBotHistory();
});

createRoot(document.getElementById("root")!).render(<App />);
