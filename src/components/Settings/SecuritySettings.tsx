
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SecuritySettings() {
  return (
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
  );
}
