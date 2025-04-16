
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Reports() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Reports</h1>
              <p className="text-muted-foreground">View and export case analytics and reports</p>
            </div>
            <Button className="bg-law-teal hover:bg-law-teal/90">Generate Report</Button>
          </div>
          
          <Card className="p-6">
            <div className="text-center py-8">
              <p className="text-lg mb-4 text-muted-foreground">Select a report type to generate</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline">Case Status Summary</Button>
                <Button variant="outline">Financial Reports</Button>
                <Button variant="outline">Activity Timeline</Button>
                <Button variant="outline">Custom Report</Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
