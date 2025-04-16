
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import CaseForm from "@/components/Cases/CaseForm";
import { toast } from "sonner";

export default function NewCase() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelClick = () => {
    navigate("/cases");
  };

  const handleSuccess = (caseId: string) => {
    toast.success("Case created successfully", {
      description: "The new case has been created.",
    });
    navigate(`/case/${caseId}`);
  };
  
  const handleError = (errorMessage: string) => {
    toast.error("Failed to create case", {
      description: errorMessage || "Please try again.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center mb-6">
            <Button variant="outline" size="sm" asChild className="mr-4">
              <Link to="/cases">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cases
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Create New Case</h1>
          </div>

          <CaseForm 
            onCancel={handleCancelClick}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </main>
      </div>
    </div>
  );
}
