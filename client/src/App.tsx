import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import BlogPost from "@/pages/BlogPost";
import CategoryPage from "@/pages/CategoryPage";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import AdminEditor from "@/pages/AdminEditor";
import Layout from "@/components/layout/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/post/:slug" component={BlogPost} />
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/about" component={About} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/edit/:id" component={AdminEditor} />
        <Route path="/admin/new" component={AdminEditor} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
