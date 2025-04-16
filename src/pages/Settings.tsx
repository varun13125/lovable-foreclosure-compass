import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Settings() {
  const [templates, setTemplates] = useState([
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
  
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    content: ""
  });
  
  const [editingTemplate, setEditingTemplate] = useState<null | {
    id: number;
    name: string;
    description: string;
    content: string;
  }>(null);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  const handleAddTemplate = () => {
    if (!newTemplate.name) {
      toast.error("Template name is required");
      return;
    }
    
    const newId = templates.length ? Math.max(...templates.map(t => t.id)) + 1 : 1;
    
    setTemplates([
      ...templates,
      {
        id: newId,
        name: newTemplate.name,
        description: newTemplate.description,
        content: newTemplate.content
      }
    ]);
    
    setNewTemplate({
      name: "",
      description: "",
      content: ""
    });
    
    setOpenAddDialog(false);
    toast.success("Template added successfully");
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate({...template});
    setOpenEditDialog(true);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate?.name) {
      toast.error("Template name is required");
      return;
    }

    setTemplates(templates.map(t => 
      t.id === editingTemplate.id ? editingTemplate : t
    ));
    
    setOpenEditDialog(false);
    toast.success("Template updated successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application preferences</p>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="templates">Document Templates</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName"
                        type="text" 
                        defaultValue="Jennifer Lee"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email" 
                        defaultValue="jennifer@forelaw.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input 
                        id="jobTitle"
                        type="text" 
                        defaultValue="Associate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone"
                        type="text" 
                        defaultValue="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      className="bg-law-teal hover:bg-law-teal/90"
                      onClick={() => toast.success("Profile updated successfully")}
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="templates">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Document Templates</CardTitle>
                    <CardDescription>Manage your document templates for case generation</CardDescription>
                  </div>
                  <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-law-teal hover:bg-law-teal/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Template</DialogTitle>
                        <DialogDescription>
                          Create a new document template for your cases.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="template-name">Template Name</Label>
                          <Input
                            id="template-name"
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                            placeholder="e.g., Settlement Agreement"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template-description">Description</Label>
                          <Input
                            id="template-description"
                            value={newTemplate.description}
                            onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                            placeholder="Brief description of the template"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template-content">Template Content</Label>
                          <Textarea
                            id="template-content"
                            rows={8}
                            value={newTemplate.content}
                            onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                            placeholder="Enter the template content here..."
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                        <Button 
                          className="bg-law-teal hover:bg-law-teal/90"
                          onClick={handleAddTemplate}
                        >
                          Add Template
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control how you receive alerts and reminders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Deadline Reminders</p>
                        <p className="text-sm text-muted-foreground">Get notified about upcoming deadlines</p>
                      </div>
                      <Input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Case Updates</p>
                        <p className="text-sm text-muted-foreground">Receive notifications about case status changes</p>
                      </div>
                      <Input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        className="bg-law-teal hover:bg-law-teal/90"
                        onClick={() => toast.success("Notification preferences updated")}
                      >
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Change Password</Label>
                      <div className="grid gap-2">
                        <Input 
                          type="password" 
                          placeholder="Current password" 
                        />
                        <Input 
                          type="password" 
                          placeholder="New password" 
                        />
                        <Input 
                          type="password" 
                          placeholder="Confirm new password" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => toast.info("2FA setup would launch here")}
                      >
                        Enable
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        className="bg-law-teal hover:bg-law-teal/90"
                        onClick={() => toast.success("Security settings updated")}
                      >
                        Update Security
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update your document template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-template-name">Template Name</Label>
              <Input
                id="edit-template-name"
                value={editingTemplate?.name || ''}
                onChange={(e) => setEditingTemplate({...editingTemplate!, name: e.target.value})}
                placeholder="e.g., Settlement Agreement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-template-description">Description</Label>
              <Input
                id="edit-template-description"
                value={editingTemplate?.description || ''}
                onChange={(e) => setEditingTemplate({...editingTemplate!, description: e.target.value})}
                placeholder="Brief description of the template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-template-content">Template Content</Label>
              <Textarea
                id="edit-template-content"
                rows={8}
                value={editingTemplate?.content || ''}
                onChange={(e) => setEditingTemplate({...editingTemplate!, content: e.target.value})}
                placeholder="Enter the template content here..."
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button 
              className="bg-law-teal hover:bg-law-teal/90"
              onClick={handleUpdateTemplate}
            >
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
