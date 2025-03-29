import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Code } from "lucide-react";
import { getTimeBasedGreeting } from "@/lib/utils/greeting";

export default function Home() {
  // Define the health response type
  type HealthResponse = {
    status: string;
    timestamp: string;
  };
  
  // Check if the API is available
  const { data, isLoading, isError } = useQuery<HealthResponse>({
    queryKey: ['/api/health'],
    retry: 1
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Code className="h-8 w-8 mr-2 text-primary" />
              Code with Mike
            </h1>
            <p className="text-muted-foreground mt-1">Backend Monorepo Setup</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <Link href="/users">
                Manage Users
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Express + TypeScript</CardTitle>
              <CardDescription>Basic server configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A type-safe Express.js server with modern ES modules and strict TypeScript settings.
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <span className="text-xs text-muted-foreground">Phase 1</span>
                <span className="text-xs bg-green-500/10 text-green-500 rounded-full px-2 py-1">Complete</span>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prisma + SQLite</CardTitle>
              <CardDescription>Database ORM integration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Prisma ORM with SQLite database provides type-safe data access with auto-generated client.
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <span className="text-xs text-muted-foreground">Phase 2</span>
                <span className="text-xs bg-green-500/10 text-green-500 rounded-full px-2 py-1">Complete</span>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monorepo Structure</CardTitle>
              <CardDescription>Shared packages and utilities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A monorepo setup with shared utility functions in the packages directory.
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <span className="text-xs text-muted-foreground">Phase 3</span>
                <span className="text-xs bg-green-500/10 text-green-500 rounded-full px-2 py-1">Complete</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        <Separator className="my-8" />

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Server Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Checking server status...</p>
              ) : isError ? (
                <div className="p-4 border border-red-800 bg-red-900/20 rounded-md">
                  <p className="text-red-400">Server API is currently unavailable</p>
                </div>
              ) : (
                <div className="p-4 border border-green-800 bg-green-900/20 rounded-md">
                  <p className="text-green-400">Server API is running properly</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last checked: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Unknown'}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">{getTimeBasedGreeting()}, welcome to your Express + TypeScript + Prisma backend!</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
