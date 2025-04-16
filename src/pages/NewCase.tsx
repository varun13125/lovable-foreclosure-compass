
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CaseForm from "@/components/Cases/CaseForm";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function NewCase() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Create New Case</h1>
              <p className="text-muted-foreground">Enter details for the new foreclosure case</p>
            </div>
          </div>
          <CaseForm onCancel={handleCancel} />
        </main>
      </div>
    </div>
  );
}
