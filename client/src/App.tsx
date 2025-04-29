import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import BlogPost from "@/pages/BlogPost";
import CategoryPage from "@/pages/CategoryPage";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
// Import v2 editor and also AdminEditor as a fallback
import EditPost from "@/pages/edit-post-v2";
import AdminEditor from "@/pages/AdminEditor"; 
import AuthPage from "@/pages/auth-page";
import Layout from "@/components/layout/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/post/:slug" component={BlogPost} />
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/about" component={About} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/admin" component={Admin} />
        <ProtectedRoute path="/admin/edit/:id" component={EditPost} />
        <ProtectedRoute path="/admin/new" component={EditPost} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
