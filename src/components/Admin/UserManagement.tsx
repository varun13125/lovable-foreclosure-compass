
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LawFirm, UserProfile } from '@/types';
import { Loader2, Plus } from 'lucide-react';

interface UserManagementProps {
  users: UserProfile[];
  lawFirms: LawFirm[];
  onUsersUpdated: () => void;
}

export default function UserManagement({ users, lawFirms, onUsersUpdated }: UserManagementProps) {
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'staff' as 'staff' | 'manager' | 'admin' | 'client' | 'system_admin',
    law_firm_id: ''
  });

  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!newUser.email || !newUser.first_name || !newUser.last_name || !newUser.role) {
        toast.error('Please fill all required fields');
        return;
      }
      
      // Generate a random password
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: newUser.first_name,
          last_name: newUser.last_name
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        toast.error('Failed to create user');
        return;
      }
      
      // Now create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: newUser.role,
          law_firm_id: newUser.law_firm_id || null
        })
        .eq('id', authData.user.id);
      
      if (profileError) throw profileError;
      
      toast.success('User created successfully');
      toast.info(`Temporary password: ${tempPassword}`);
      onUsersUpdated();
      setNewUserDialogOpen(false);
      setNewUser({
        email: '',
        first_name: '',
        last_name: '',
        role: 'staff',
        law_firm_id: ''
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const validRoles = ['staff', 'manager', 'admin', 'client', 'system_admin'];
      if (!validRoles.includes(newRole)) {
        toast.error('Invalid role selected');
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as 'staff' | 'manager' | 'admin' | 'client' | 'system_admin' })
        .eq('id', userId);
      
      if (error) throw error;
      
      onUsersUpdated();
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'system_admin': return 'bg-red-500';
      case 'admin': return 'bg-law-teal';
      case 'manager': return 'bg-blue-500';
      case 'staff': return 'bg-gray-500';
      case 'client': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        
        <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-law-teal hover:bg-law-teal/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={newUser.first_name} 
                    onChange={e => setNewUser({...newUser, first_name: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={newUser.last_name} 
                    onChange={e => setNewUser({...newUser, last_name: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={value => setNewUser({
                    ...newUser, 
                    role: value as 'staff' | 'manager' | 'admin' | 'client' | 'system_admin'
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="system_admin">System Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lawFirm">Law Firm</Label>
                <Select 
                  value={newUser.law_firm_id} 
                  onValueChange={value => setNewUser({...newUser, law_firm_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select law firm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {lawFirms.map(firm => (
                      <SelectItem key={firm.id} value={firm.id}>
                        {firm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-law-teal hover:bg-law-teal/90" 
                onClick={handleCreateUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left font-medium">User</th>
              <th className="h-10 px-2 text-left font-medium">Email</th>
              <th className="h-10 px-2 text-left font-medium">Role</th>
              <th className="h-10 px-2 text-left font-medium">Law Firm</th>
              <th className="h-10 px-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                  <div className="font-medium">
                    {user.firstName && user.lastName ? 
                      `${user.firstName} ${user.lastName}` : 
                      'Unnamed User'}
                  </div>
                </td>
                <td className="px-2">{user.email}</td>
                <td className="px-2">
                  <Select 
                    value={user.role} 
                    onValueChange={value => handleUpdateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="h-8 w-28 text-xs py-0">
                      <SelectValue placeholder={user.role} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="system_admin">System Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2">{user.lawFirmName || 'N/A'}</td>
                <td className="px-2 text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetPassword(user.id, user.email)}
                  >
                    Reset Password
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
