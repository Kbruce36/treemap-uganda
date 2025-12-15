import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { sdgData } from "@/data/sdgData";
import { 
  ArrowLeft,
  ArrowRight,
  Target,
  Lightbulb,
  TreePine
} from "lucide-react";

const SDGDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const sdgId = parseInt(id || "1", 10);
  
  const sdg = sdgData.find(s => s.id === sdgId);
  const prevSdg = sdgData.find(s => s.id === sdgId - 1);
  const nextSdg = sdgData.find(s => s.id === sdgId + 1);

  if (!sdg) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">SDG Not Found</h1>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className={`py-16 md:py-24 bg-gradient-to-br ${sdg.color}`}>
        <div className="container mx-auto px-4 text-center">
          <Button 
            variant="ghost" 
            className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Goals
          </Button>
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">{sdg.id}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {sdg.title}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {sdg.description}
          </p>
        </div>
      </section>

      {/* Targets Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Key Targets</h2>
            </div>
            
            <div className="space-y-4">
              {sdg.targets.map((target, index) => (
                <Card key={index}>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sdg.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-foreground">{target}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Help Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Lightbulb className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">How You Can Help</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {sdg.howToHelp.map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sdg.color} flex items-center justify-center mb-4`}>
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-foreground">{action}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TreeMap CTA for SDG 15 */}
      {sdg.id === 15 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto overflow-hidden">
              <div className="grid md:grid-cols-2">
                <CardContent className="p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-3">Join UNAU TreeMap</h3>
                  <p className="text-muted-foreground mb-6">
                    Take action on SDG 15 by joining our tree planting initiative at 
                    Kyambogo University. Track your contributions and compete with others!
                  </p>
                  <Button className="w-fit" onClick={() => navigate("/treemap")}>
                    <TreePine className="w-4 h-4 mr-2" />
                    Open TreeMap
                  </Button>
                </CardContent>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 flex items-center justify-center">
                  <TreePine className="w-24 h-24 text-white/80" />
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Navigation */}
      <section className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            {prevSdg ? (
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/sdg/${prevSdg.id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{prevSdg.shortTitle}</span>
                <span className="sm:hidden">Previous</span>
              </Button>
            ) : (
              <div />
            )}
            
            <Button variant="outline" onClick={() => navigate("/")}>
              All Goals
            </Button>
            
            {nextSdg ? (
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/sdg/${nextSdg.id}`)}
              >
                <span className="hidden sm:inline">{nextSdg.shortTitle}</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SDGDetail;
