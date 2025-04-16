
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Settings() {
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
                      <label className="text-sm font-medium">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md" 
                        defaultValue="Jennifer Lee"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border rounded-md" 
                        defaultValue="jennifer@forelaw.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Job Title</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md" 
                        defaultValue="Associate"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md" 
                        defaultValue="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-law-teal hover:bg-law-teal/90">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Document Templates</CardTitle>
                  <CardDescription>Manage your document templates for case generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Demand Letter</p>
                        <p className="text-sm text-muted-foreground">Default template for initial demands</p>
                      </div>
                      <Button variant="outline">Edit</Button>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Petition</p>
                        <p className="text-sm text-muted-foreground">Standard foreclosure petition</p>
                      </div>
                      <Button variant="outline">Edit</Button>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Order Nisi</p>
                        <p className="text-sm text-muted-foreground">Court order template</p>
                      </div>
                      <Button variant="outline">Edit</Button>
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-law-teal hover:bg-law-teal/90">Add New Template</Button>
                    </div>
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
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Deadline Reminders</p>
                        <p className="text-sm text-muted-foreground">Get notified about upcoming deadlines</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Case Updates</p>
                        <p className="text-sm text-muted-foreground">Receive notifications about case status changes</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-law-teal hover:bg-law-teal/90">Save Preferences</Button>
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
                      <label className="text-sm font-medium">Change Password</label>
                      <div className="grid gap-2">
                        <input 
                          type="password" 
                          placeholder="Current password" 
                          className="w-full p-2 border rounded-md" 
                        />
                        <input 
                          type="password" 
                          placeholder="New password" 
                          className="w-full p-2 border rounded-md" 
                        />
                        <input 
                          type="password" 
                          placeholder="Confirm new password" 
                          className="w-full p-2 border rounded-md" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                    <div className="flex justify-end">
                      <Button className="bg-law-teal hover:bg-law-teal/90">Update Security</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
