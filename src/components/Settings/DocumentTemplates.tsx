
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TemplateDialog from "./TemplateDialog";
import { toast } from "sonner";

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
}

export default function DocumentTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  
  // Load templates from local storage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('document_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Default templates if none exist
      const defaultTemplates = [
        {
          id: 1,
          name: "Demand Letter",
          description: "Default template for initial demands",
          content: "WITHOUT PREJUDICE\n\nDATE: {date}\n\nRE: DEMAND FOR PAYMENT\n\nProperty: {property.address}\nMortgage Registration: {mortgage.number}\nBalance Due: {mortgage.balance}\n\nDear {borrower.name},\n\nPlease be advised that we represent {lender.name} in connection with the above-noted mortgage. Our client advises that you are in default of your payment obligations under the mortgage.\n\nAs of {date}, the following amounts are due and owing:\n\nPrincipal Balance: {mortgage.balance}\nArrears: {mortgage.arrears}\nPer Diem Interest: {mortgage.per_diem}/day\n\nDEMAND IS HEREBY MADE for payment of the full amount due and owing within 10 days of the date of this letter, failing which our client may commence foreclosure proceedings without further notice to you.\n\nYours truly,"
        },
        {
          id: 2,
          name: "Petition",
          description: "Standard foreclosure petition",
          content: "No. {court.file_number}\n{court.registry} Registry\n\nIN THE SUPREME COURT OF BRITISH COLUMBIA\n\nBETWEEN:\n{lender.name}\nPETITIONER\n\nAND:\n{borrower.name}\nRESPONDENT"
        },
        {
          id: 3,
          name: "Order Nisi",
          description: "Court order template",
          content: "ORDER NISI OF FORECLOSURE\n\nNo. {court.file_number}\n{court.registry} Registry\n\nBEFORE THE HONOURABLE\nJUSTICE {court.judge_name}\n)\n)\n) {court.hearing_date}\n\nBETWEEN:\n{lender.name}\nPETITIONER\n\nAND:\n{borrower.name}\nRESPONDENT\n\nORDER"
        }
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('document_templates', JSON.stringify(defaultTemplates));
    }
  }, []);
  
  // Save templates to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('document_templates', JSON.stringify(templates));
  }, [templates]);
  
  const handleAddTemplate = (templateData: {name: string; description: string; content: string}) => {
    if (!templateData.name) {
      toast.error("Template name is required");
      return;
    }
    
    const newId = templates.length ? Math.max(...templates.map(t => t.id)) + 1 : 1;
    
    const newTemplates = [
      ...templates,
      {
        id: newId,
        name: templateData.name,
        description: templateData.description,
        content: templateData.content
      }
    ];
    
    setTemplates(newTemplates);
    localStorage.setItem('document_templates', JSON.stringify(newTemplates));
    
    setOpenAddDialog(false);
    toast.success("Template added successfully");
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setOpenEditDialog(true);
  };

  const handleUpdateTemplate = (templateData: {name: string; description: string; content: string}, id?: number) => {
    if (!templateData.name) {
      toast.error("Template name is required");
      return;
    }

    if (id) {
      const updatedTemplates = templates.map(t => 
        t.id === id ? {...templateData, id} : t
      );
      
      setTemplates(updatedTemplates);
      localStorage.setItem('document_templates', JSON.stringify(updatedTemplates));
      
      setOpenEditDialog(false);
      setEditingTemplate(null);
      toast.success("Template updated successfully");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Document Templates</CardTitle>
          <CardDescription>Manage your document templates for case generation</CardDescription>
        </div>
        <TemplateDialog
          open={openAddDialog}
          onOpenChange={setOpenAddDialog}
          onSave={handleAddTemplate}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => handleEditTemplate(template)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No templates found. Create your first template.</p>
            </div>
          )}
        </div>

        {/* Edit Template Dialog */}
        {editingTemplate && (
          <TemplateDialog
            isEditing
            template={editingTemplate}
            open={openEditDialog}
            onOpenChange={(open) => {
              setOpenEditDialog(open);
              if (!open) setEditingTemplate(null);
            }}
            onSave={handleUpdateTemplate}
          />
        )}
      </CardContent>
    </Card>
  );
}
