
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function NotificationSettings() {
  return (
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
  );
}
