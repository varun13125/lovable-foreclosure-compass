
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Messages() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Messages</h1>
              <p className="text-muted-foreground">Manage your communications</p>
            </div>
            <Button className="bg-law-teal hover:bg-law-teal/90">New Message</Button>
          </div>
          
          <Card className="p-6">
            <div className="text-center py-8">
              <p className="text-lg mb-4 text-muted-foreground">Your messages will appear here</p>
              <Button className="bg-law-teal hover:bg-law-teal/90">Start New Conversation</Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
