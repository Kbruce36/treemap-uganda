import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Globe, 
  Target, 
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <Globe className="w-16 h-16 text-primary-foreground mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            About the SDGs
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Understanding the Sustainable Development Goals and their importance for our planet's future.
          </p>
        </div>
      </section>

      {/* What are SDGs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">What are the SDGs?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              The Sustainable Development Goals (SDGs), also known as the Global Goals, were adopted by 
              the United Nations in 2015 as a universal call to action to end poverty, protect the planet, 
              and ensure that by 2030 all people enjoy peace and prosperity.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              The 17 SDGs are integrated—they recognize that action in one area will affect outcomes in 
              others, and that development must balance social, economic and environmental sustainability.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">17 Goals</h3>
                  <p className="text-muted-foreground text-sm">
                    Covering all aspects of sustainable development
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">193 Countries</h3>
                  <p className="text-muted-foreground text-sm">
                    Committed to achieving these goals
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">2030 Deadline</h3>
                  <p className="text-muted-foreground text-sm">
                    Target year for achieving all goals
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Ps */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">The 5 Ps of Sustainable Development</h2>
            
            <div className="space-y-6">
              {[
                {
                  title: "People",
                  description: "End poverty and hunger in all forms and ensure dignity and equality.",
                  goals: "SDGs 1, 2, 3, 4, 5"
                },
                {
                  title: "Planet",
                  description: "Protect our planet's natural resources and climate for future generations.",
                  goals: "SDGs 6, 12, 13, 14, 15"
                },
                {
                  title: "Prosperity",
                  description: "Ensure prosperous and fulfilling lives in harmony with nature.",
                  goals: "SDGs 7, 8, 9, 10, 11"
                },
                {
                  title: "Peace",
                  description: "Foster peaceful, just, and inclusive societies.",
                  goals: "SDG 16"
                },
                {
                  title: "Partnership",
                  description: "Implement the agenda through global partnership.",
                  goals: "SDG 17"
                }
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6 flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-muted-foreground mb-2">{item.description}</p>
                      <span className="text-sm text-primary font-medium">{item.goals}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">Why Do the SDGs Matter?</h2>
            <div className="prose prose-lg text-muted-foreground">
              <p className="mb-4">
                The SDGs provide a shared blueprint for peace and prosperity for people and the planet, 
                now and into the future. They address the global challenges we face, including those 
                related to poverty, inequality, climate change, environmental degradation, peace and justice.
              </p>
              <p className="mb-4">
                Countries, cities, businesses, and individuals all have a role to play. By working 
                together, we can create a better world for current and future generations.
              </p>
              <p>
                Every action matters. From planting trees to reducing waste, from supporting education 
                to promoting equality—your contributions help move us closer to achieving these goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Take Action?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Explore all 17 goals and find ways you can contribute to sustainable development.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/")}>
              Explore All SDGs <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/treemap")}>
              Try TreeMap
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
