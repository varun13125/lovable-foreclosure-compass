
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface TemplateDialogProps {
  isEditing?: boolean;
  template?: {
    id: number;
    name: string;
    description: string;
    content: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (templateData: {name: string; description: string; content: string}, id?: number) => void;
}

export default function TemplateDialog({ 
  isEditing = false, 
  template, 
  open, 
  onOpenChange, 
  onSave 
}: TemplateDialogProps) {
  const [templateData, setTemplateData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    content: template?.content || ""
  });
  
  // Update form when template prop changes
  useEffect(() => {
    if (template) {
      setTemplateData({
        name: template.name,
        description: template.description,
        content: template.content
      });
    }
  }, [template]);

  const handleSave = () => {
    if (isEditing && template) {
      onSave(templateData, template.id);
    } else {
      onSave(templateData);
    }
    
    if (!isEditing) {
      // Only reset on new templates, not when editing
      setTemplateData({
        name: "",
        description: "",
        content: ""
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button className="bg-law-teal hover:bg-law-teal/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Template" : "Add New Template"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your document template." : "Create a new document template for your cases."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateData.name}
              onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
              placeholder="e.g., Settlement Agreement"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Input
              id="template-description"
              value={templateData.description}
              onChange={(e) => setTemplateData({...templateData, description: e.target.value})}
              placeholder="Brief description of the template"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-content">Template Content</Label>
            <div className="mb-1 text-xs text-muted-foreground">
              Use variables like {'{property.address}'}, {'{borrower.name}'}, {'{mortgage.balance}'} to auto-fill data
            </div>
            <Textarea
              id="template-content"
              rows={8}
              value={templateData.content}
              onChange={(e) => setTemplateData({...templateData, content: e.target.value})}
              placeholder="Enter the template content here..."
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            className="bg-law-teal hover:bg-law-teal/90"
            onClick={handleSave}
          >
            {isEditing ? "Update Template" : "Add Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
