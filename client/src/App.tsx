import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/index";
import UsersPage from "@/pages/users/index";
import CreateUserPage from "@/pages/users/create";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/users" component={UsersPage} />
      <Route path="/users/create" component={CreateUserPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
