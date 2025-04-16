
import { useState } from "react";
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
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      name: "Demand Letter",
      description: "Default template for initial demands",
      content: "This is a sample demand letter template content."
    },
    {
      id: 2,
      name: "Petition",
      description: "Standard foreclosure petition",
      content: "This is a sample petition template content."
    },
    {
      id: 3,
      name: "Order Nisi",
      description: "Court order template",
      content: "This is a sample court order template content."
    }
  ]);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  
  const handleAddTemplate = (templateData: {name: string; description: string; content: string}) => {
    if (!templateData.name) {
      toast.error("Template name is required");
      return;
    }
    
    const newId = templates.length ? Math.max(...templates.map(t => t.id)) + 1 : 1;
    
    setTemplates([
      ...templates,
      {
        id: newId,
        name: templateData.name,
        description: templateData.description,
        content: templateData.content
      }
    ]);
    
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
      setTemplates(templates.map(t => 
        t.id === id ? {...templateData, id} : t
      ));
      
      setOpenEditDialog(false);
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
