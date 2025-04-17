import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, Clock, AlertTriangle } from "lucide-react";

import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import CaseStatusChart from "@/components/Dashboard/CaseStatusChart";
import DeadlineCalendar from "@/components/Dashboard/DeadlineCalendar";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import CaseList from "@/components/Cases/CaseList";
import DocumentGenerator from "@/components/Documents/DocumentGenerator";

const Index = () => {
  const upcomingDeadlines = [
    {
      id: 1,
      title: "Send Demand Letter - Smith",
      date: "Tomorrow",
      priority: "high"
    },
    {
      id: 2,
      title: "File Petition - Johnson",
      date: "In 3 days",
      priority: "medium"
    },
    {
      id: 3,
      title: "Redemption Period Ends - Chen",
      date: "Next week",
      priority: "medium"
    }
  ];

  const quickStartActions = [
    {
      title: "Create New Case",
      icon: Grid,
      href: "/new-case",
      description: "Start a new foreclosure case"
    },
    {
      title: "Generate Document",
      icon: Clock,
      href: "/documents",
      description: "Create legal documents from templates"
    },
    {
      title: "Check Deadlines",
      icon: AlertTriangle,
      href: "/calendar",
      description: "View upcoming case deadlines"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Foreclosure Management Dashboard</h1>
              <p className="text-muted-foreground">Welcome back to ForeLaw</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-law-teal hover:bg-law-teal/90" asChild>
                <Link to="/new-case">Create New Case</Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cases">Cases</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and workflows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quickStartActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start h-auto py-3"
                          asChild
                        >
                          <Link to={action.href}>
                            <div className="flex items-start">
                              <div className="mr-3 mt-1">
                                <action.icon className="h-5 w-5 text-law-teal" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium">{action.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {action.description}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Urgent Deadlines</CardTitle>
                    <CardDescription>Upcoming dates requiring action</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingDeadlines.map((deadline) => (
                        <div
                          key={deadline.id}
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              deadline.priority === 'high' ? 'bg-destructive' : 'bg-amber-500'
                            }`} />
                            <div>
                              <div className="font-medium text-sm">{deadline.title}</div>
                              <div className="text-xs text-muted-foreground">{deadline.date}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8" asChild>
                            <Link to="/calendar">View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <DeadlineCalendar />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CaseStatusChart />
                <RecentActivity />
              </div>
            </TabsContent>

            <TabsContent value="cases" className="mt-4">
              <CaseList />
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <DocumentGenerator selectedCase={null} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default Index;
