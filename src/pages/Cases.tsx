
import CaseList from "@/components/Cases/CaseList";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Cases() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Cases</h1>
              <p className="text-muted-foreground">Manage and track foreclosure cases</p>
            </div>
          </div>
          <CaseList />
        </main>
      </div>
    </div>
  );
}
