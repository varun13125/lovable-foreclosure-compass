
import { Button } from "@/components/ui/button";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import DocumentGenerator from "@/components/Documents/DocumentGenerator";

export default function Documents() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Documents</h1>
              <p className="text-muted-foreground">Generate and manage legal documents</p>
            </div>
            <Button className="bg-law-teal hover:bg-law-teal/90">Create Document</Button>
          </div>
          <DocumentGenerator />
        </main>
      </div>
    </div>
  );
}
