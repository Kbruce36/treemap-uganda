import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Leaf, Map, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { useStatistics } from "@/hooks/use-statistics";

const Index = () => {
  const navigate = useNavigate();
  const { totalTrees, activePlanters, treeSpecies, loading, error } = useStatistics();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 gradient-hero rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow animate-pulse">
              <Leaf className="w-14 h-14 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Greentrack
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our community in making Kyambogo University greener. Track, map, and celebrate every tree we plant together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate("/map")}
                className="text-lg"
              >
                Start Planting
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/leaderboard")}
                className="text-lg"
              >
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Impact</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No account needed to see what we've accomplished together
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
            <Card className="shadow-card hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary/20">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Map className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">View the Tree Map</h3>
                <p className="text-muted-foreground mb-6">
                  Browse the interactive map to see every tree planted across Kyambogo University campus. View locations, species, and planting details.
                </p>
                <Button variant="outline" onClick={() => navigate("/map")} className="w-full">
                  Explore Map
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-secondary/20">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Trophy className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">Check the Leaderboard</h3>
                <p className="text-muted-foreground mb-6">
                  See who's leading the green movement! View rankings of top planters and celebrate our community's collective environmental impact.
                </p>
                <Button variant="outline" onClick={() => navigate("/leaderboard")} className="w-full">
                  View Rankings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Ready to contribute? Sign in to start planting your own trees!
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How to Plant Trees</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to make a lasting environmental impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="shadow-card hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-primary/20">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Map className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">Pin Your Tree</h3>
                <p className="text-muted-foreground">
                  Click anywhere on the interactive map to mark where you've planted a tree
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-secondary/20">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Leaf className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">Add Details</h3>
                <p className="text-muted-foreground">
                  Record the species, date, and any special notes about your tree
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-glow transition-all duration-300 border-2 border-transparent hover:border-accent/20">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Trophy className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">Track Impact</h3>
                <p className="text-muted-foreground">
                  See your contribution grow and compete on the leaderboard
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
        <Card className="shadow-glow border-2 border-primary/10">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Growing Impact</h2>
              <p className="text-muted-foreground text-lg">
                Real-time statistics from our community's tree planting efforts
              </p>
              {error && (
                <p className="text-destructive text-sm mt-2">
                  Unable to load current statistics. Please try again later.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 min-h-[4rem] flex items-center justify-center">
                  {loading ? (
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  ) : error ? (
                    <span className="text-2xl text-muted-foreground">--</span>
                  ) : (
                    totalTrees.toLocaleString()
                  )}
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Trees Planted</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2 min-h-[4rem] flex items-center justify-center">
                  {loading ? (
                    <Loader2 className="w-12 h-12 animate-spin text-secondary" />
                  ) : error ? (
                    <span className="text-2xl text-muted-foreground">--</span>
                  ) : (
                    activePlanters.toLocaleString()
                  )}
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Active Planters</p>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2 min-h-[4rem] flex items-center justify-center">
                  {loading ? (
                    <Loader2 className="w-12 h-12 animate-spin text-accent" />
                  ) : error ? (
                    <span className="text-2xl text-muted-foreground">--</span>
                  ) : (
                    treeSpecies.toLocaleString()
                  )}
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Tree Species</p>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join Greentrack and start planting trees today. Every tree counts towards a greener tomorrow.
            </p>
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg"
            >
              Get Started
              <Leaf className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
