import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SDGHubHome from "./pages/SDGHubHome";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SDGDetail from "./pages/SDGDetail";
import TreeMapHome from "./pages/Index";
import Auth from "./pages/Auth";
import MapPage from "./pages/MapPage";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import UserTrees from "./pages/UserTrees";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* SDG Hub Routes */}
          <Route path="/" element={<SDGHubHome />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sdg/:id" element={<SDGDetail />} />
          
          {/* TreeMap Routes */}
          <Route path="/treemap" element={<TreeMapHome />} />
          <Route path="/treemap/map" element={<MapPage />} />
          <Route path="/treemap/leaderboard" element={<Leaderboard />} />
          <Route path="/treemap/profile" element={<Profile />} />
          <Route path="/treemap/user/:userId/trees" element={<UserTrees />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
