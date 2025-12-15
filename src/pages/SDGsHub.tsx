import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  TreePine, 
  Droplets, 
  Sun, 
  Recycle, 
  GraduationCap, 
  Heart,
  Target,
  ArrowRight
} from "lucide-react";

const sdgProjects = [
  {
    id: "treemap",
    sdg: 15,
    title: "TreeMap",
    subtitle: "Life on Land",
    description: "Track and document tree planting activities across Kyambogo University campus.",
    icon: TreePine,
    color: "from-green-500 to-emerald-600",
    status: "active" as const,
    path: "/map",
    stats: "Active Project"
  },
  {
    id: "water",
    sdg: 6,
    title: "Water Sources",
    subtitle: "Clean Water & Sanitation",
    description: "Map clean water points, boreholes, and wells across the campus and community.",
    icon: Droplets,
    color: "from-blue-500 to-cyan-600",
    status: "coming" as const,
    path: null,
    stats: "Coming Soon"
  },
  {
    id: "energy",
    sdg: 7,
    title: "Clean Energy",
    subtitle: "Affordable & Clean Energy",
    description: "Document renewable energy installations and solar panel deployments.",
    icon: Sun,
    color: "from-yellow-500 to-orange-500",
    status: "coming" as const,
    path: null,
    stats: "Coming Soon"
  },
  {
    id: "waste",
    sdg: 12,
    title: "Waste Collection",
    subtitle: "Responsible Consumption",
    description: "Log cleanup events, recycling drives, and waste management initiatives.",
    icon: Recycle,
    color: "from-teal-500 to-green-600",
    status: "coming" as const,
    path: null,
    stats: "Coming Soon"
  },
  {
    id: "education",
    sdg: 4,
    title: "Study Spaces",
    subtitle: "Quality Education",
    description: "Find and share study locations, tutoring spots, and learning resources.",
    icon: GraduationCap,
    color: "from-red-500 to-pink-600",
    status: "coming" as const,
    path: null,
    stats: "Coming Soon"
  },
  {
    id: "health",
    sdg: 3,
    title: "Health Resources",
    subtitle: "Good Health & Well-being",
    description: "Map first aid stations, wellness spots, and health resources on campus.",
    icon: Heart,
    color: "from-rose-500 to-red-600",
    status: "coming" as const,
    path: null,
    stats: "Coming Soon"
  },
];

const SDGsHub = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Target className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
            UNAU SDGs Hub
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            United Nations Association of Uganda - Kyambogo Chapter's platform for tracking 
            Sustainable Development Goals initiatives across our campus and community.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[15, 6, 7, 12, 4, 3].map((sdg) => (
              <span 
                key={sdg}
                className="px-3 py-1 bg-primary-foreground/20 rounded-full text-sm text-primary-foreground font-medium"
              >
                SDG {sdg}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Initiatives</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our SDG-aligned projects. Each initiative helps track and measure 
              our collective impact toward sustainable development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sdgProjects.map((project) => {
              const Icon = project.icon;
              const isActive = project.status === "active";
              
              return (
                <Card 
                  key={project.id}
                  className={`group relative overflow-hidden transition-all duration-300 ${
                    isActive 
                      ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer border-primary/20" 
                      : "opacity-75"
                  }`}
                  onClick={() => isActive && project.path && navigate(project.path)}
                >
                  {/* SDG Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${project.color}`}>
                      SDG {project.sdg}
                    </span>
                  </div>

                  <CardHeader className="pb-2">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <CardDescription className="text-sm font-medium text-primary">
                      {project.subtitle}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isActive 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {project.stats}
                      </span>
                      
                      {isActive && (
                        <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                          Explore <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Start Making an Impact Today
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join TreeMap, our flagship initiative, and help us track tree planting 
            across Kyambogo University.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate("/map")}>
              <TreePine className="w-5 h-5 mr-2" />
              Open TreeMap
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/leaderboard")}>
              View Leaderboard
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SDGsHub;
