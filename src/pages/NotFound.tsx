import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { SdgWheel } from "@/components/site/Sdg";
import { PRIVATE_PAGE } from "@/lib/seo-core";
import { usePageMeta } from "@/lib/seo";

const NotFound = () => {
  const { pathname } = useLocation();
  usePageMeta(PRIVATE_PAGE("Page not found", pathname));

  return (
    <Layout>
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <SdgWheel size={140}>
          <span className="font-display text-3xl font-black text-primary">404</span>
        </SdgWheel>
        <h1 className="mt-8 font-display text-3xl font-black text-primary">This page doesn't exist</h1>
        <p className="mt-2 text-muted-foreground">It may have moved, or the link might be mistyped.</p>
        <Button asChild className="mt-6 bg-primary font-bold">
          <Link to="/">Back to the home page</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
