import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { sdgData } from "@/data/sdgData";
import { 
  TreePine, 
  Target,
  ArrowRight,
  Globe,
  Users,
  Sparkles
} from "lucide-react";

const SDGHubHome = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Globe className="w-16 h-16 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
            SDG Hub
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
            Explore the 17 Sustainable Development Goals and discover how you can 
            contribute to a better, more sustainable future for everyone.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/about")}
              className="text-lg px-8"
            >
              Learn About SDGs
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/treemap")}
              className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <TreePine className="w-5 h-5 mr-2" />
              UNAU TreeMap
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">17</p>
              <p className="text-muted-foreground">Global Goals</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">169</p>
              <p className="text-muted-foreground">Targets</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">193</p>
              <p className="text-muted-foreground">Countries</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">2030</p>
              <p className="text-muted-foreground">Target Year</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Project - TreeMap */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Featured Initiative
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">UNAU TreeMap</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our flagship project tracking tree planting activities across Kyambogo University, 
              contributing to SDG 15: Life on Land.
            </p>
          </div>

          <Card 
            className="max-w-4xl mx-auto overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => navigate("/treemap")}
          >
            <div className="grid md:grid-cols-2">
              <div className="p-8 flex flex-col justify-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6">
                  <TreePine className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Track Tree Planting</h3>
                <p className="text-muted-foreground mb-6">
                  Join the UNAU Kyambogo community in documenting and tracking tree planting 
                  efforts. View the interactive map, compete on the leaderboard, and contribute 
                  to campus greening initiatives.
                </p>
                <Button className="w-fit">
                  Explore TreeMap <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <TreePine className="w-24 h-24 mx-auto mb-4 opacity-90" />
                  <p className="text-lg font-medium">SDG 15</p>
                  <p className="text-sm opacity-80">Life on Land</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* All 17 SDGs Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">The 17 Global Goals</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Click on any goal to learn more about it and discover how you can contribute.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sdgData.map((sdg) => (
              <Card 
                key={sdg.id}
                className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                onClick={() => navigate(`/sdg/${sdg.id}`)}
              >
                <div className={`h-2 bg-gradient-to-r ${sdg.color}`} />
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sdg.color} flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white font-bold text-lg">{sdg.id}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {sdg.shortTitle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Join the Movement
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Be part of the global effort to achieve the Sustainable Development Goals. 
            Every action counts, no matter how small.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/treemap")}>
              <TreePine className="w-5 h-5 mr-2" />
              Start with TreeMap
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
              Get In Touch
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SDGHubHome;
