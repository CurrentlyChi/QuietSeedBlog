import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ComponentProps = {
  [key: string]: any;
};

export function ProtectedRoute({
  path,
  component: Component,
  ...props
}: {
  path: string;
  component: React.ComponentType<ComponentProps>;
} & ComponentProps) {
  const { user, isLoading } = useAuth();

  // Show loading UI while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // User is authenticated, render the protected component
  return (
    <Route path={path}>
      <Component {...props} />
    </Route>
  );
}