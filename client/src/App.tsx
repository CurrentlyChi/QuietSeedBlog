import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import BlogPost from "@/pages/BlogPost";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import AdminEditor from "@/pages/AdminEditor";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/post/:slug" component={BlogPost} />
        <Route path="/category/:slug" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/new" component={AdminEditor} />
        <Route path="/admin/edit/:id" component={AdminEditor} />
        <Route path="/search" component={Home} />
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
