
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, Building, Shield, Settings as SettingsIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function MasterAdmin() {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lawFirms, setLawFirms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  
  // New law firm form
  const [newLawFirm, setNewLawFirm] = useState({
    name: '',
    contact_email: '',
    subscription_tier: 'basic' as 'basic' | 'standard' | 'premium' | 'enterprise',
    subscription_status: 'active',
    enabled: true
  });

  // New user form
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'staff' as 'staff' | 'manager' | 'admin' | 'client' | 'system_admin',
    law_firm_id: ''
  });

  // Dialog states
  const [newLawFirmDialogOpen, setNewLawFirmDialogOpen] = useState(false);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);

  useEffect(() => {
    if (!authState.user) return;
    
    if (authState.user.role !== 'system_admin') {
      toast.error("You don't have permission to access this page");
      return;
    }
    
    fetchLawFirms();
    fetchUsers();
    fetchFeatures();
  }, [authState.user]);

  const fetchLawFirms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('law_firms')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setLawFirms(data || []);
    } catch (error) {
      console.error('Error fetching law firms:', error);
      toast.error('Failed to load law firms');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          law_firms (
            name
          )
        `)
        .order('email');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast.error('Failed to load features');
    }
  };

  const handleCreateLawFirm = async () => {
    try {
      // Validate form
      if (!newLawFirm.name || !newLawFirm.contact_email) {
        toast.error('Please fill all required fields');
        return;
      }

      const { data, error } = await supabase
        .from('law_firms')
        .insert([newLawFirm])
        .select();
      
      if (error) throw error;
      
      toast.success('Law firm created successfully');
      fetchLawFirms();
      setNewLawFirmDialogOpen(false);
      setNewLawFirm({
        name: '',
        contact_email: '',
        subscription_tier: 'basic' as 'basic' | 'standard' | 'premium' | 'enterprise',
        subscription_status: 'active',
        enabled: true
      });
    } catch (error) {
      console.error('Error creating law firm:', error);
      toast.error('Failed to create law firm');
    }
  };

  const handleCreateUser = async () => {
    try {
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
      fetchUsers();
      setNewUserDialogOpen(false);
      setNewUser({
        email: '',
        first_name: '',
        last_name: '',
        role: 'staff' as 'staff' | 'manager' | 'admin' | 'client' | 'system_admin',
        law_firm_id: ''
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleToggleLawFirmStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('law_firms')
        .update({ enabled: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      fetchLawFirms();
      toast.success(`Law firm ${currentStatus ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error('Error updating law firm status:', error);
      toast.error('Failed to update law firm status');
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
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      fetchUsers();
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleUpdateFeatureStatus = async (featureId: string, tier: string, status: boolean) => {
    try {
      const updateField = `${tier}_enabled`;
      
      const { error } = await supabase
        .from('features')
        .update({ [updateField]: status })
        .eq('id', featureId);
      
      if (error) throw error;
      
      fetchFeatures();
      toast.success('Feature status updated successfully');
    } catch (error) {
      console.error('Error updating feature status:', error);
      toast.error('Failed to update feature status');
    }
  };

  if (!authState.user || authState.user.role !== 'system_admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">System Administration</h1>
      
      <Tabs defaultValue="law-firms">
        <TabsList className="mb-6">
          <TabsTrigger value="law-firms" className="flex items-center">
            <Building className="mr-2 h-4 w-4" />
            Law Firms
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Features & Permissions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <SettingsIcon className="mr-2 h-4 w-4" />
            System Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="law-firms">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Law Firms</span>
                <Dialog open={newLawFirmDialogOpen} onOpenChange={setNewLawFirmDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Add New Law Firm</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Law Firm</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Firm Name</Label>
                        <Input 
                          id="name" 
                          value={newLawFirm.name} 
                          onChange={e => setNewLawFirm({...newLawFirm, name: e.target.value})}
                          placeholder="Enter law firm name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Contact Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={newLawFirm.contact_email} 
                          onChange={e => setNewLawFirm({...newLawFirm, contact_email: e.target.value})}
                          placeholder="admin@lawfirm.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subscription">Subscription Tier</Label>
                        <Select 
                          value={newLawFirm.subscription_tier} 
                          onValueChange={value => setNewLawFirm({
                            ...newLawFirm, 
                            subscription_tier: value as 'basic' | 'standard' | 'premium' | 'enterprise'
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="enabled" 
                          checked={newLawFirm.enabled}
                          onCheckedChange={checked => setNewLawFirm({
                            ...newLawFirm, 
                            enabled: checked as boolean
                          })}
                        />
                        <Label htmlFor="enabled">Enabled</Label>
                      </div>
                      <Button className="w-full" onClick={handleCreateLawFirm}>
                        Create Law Firm
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Manage all law firms in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lawFirms.map(firm => (
                      <TableRow key={firm.id}>
                        <TableCell className="font-medium">{firm.name}</TableCell>
                        <TableCell>{firm.contact_email}</TableCell>
                        <TableCell>{firm.subscription_tier}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${firm.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {firm.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={firm.enabled ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleToggleLawFirmStatus(firm.id, firm.enabled)}
                          >
                            {firm.enabled ? 'Disable' : 'Enable'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {lawFirms.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No law firms found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Users</span>
                <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Add New User</Button>
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
                      <Button className="w-full" onClick={handleCreateUser}>
                        Create User
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Manage all users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Law Firm</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select 
                          value={user.role} 
                          onValueChange={value => handleUpdateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-24 h-8 text-xs py-0">
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
                      </TableCell>
                      <TableCell>{user.law_firms?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          Reset Password
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features & Permissions</CardTitle>
              <CardDescription>
                Configure which features are available in each subscription tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>Standard</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Enterprise</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map(feature => (
                    <TableRow key={feature.id}>
                      <TableCell className="font-medium">{feature.name}</TableCell>
                      <TableCell>{feature.description}</TableCell>
                      <TableCell>
                        <Checkbox 
                          checked={feature.basic_enabled}
                          onCheckedChange={checked => 
                            handleUpdateFeatureStatus(feature.id, 'basic', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox 
                          checked={feature.standard_enabled}
                          onCheckedChange={checked => 
                            handleUpdateFeatureStatus(feature.id, 'standard', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox 
                          checked={feature.premium_enabled}
                          onCheckedChange={checked => 
                            handleUpdateFeatureStatus(feature.id, 'premium', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox 
                          checked={feature.enterprise_enabled}
                          onCheckedChange={checked => 
                            handleUpdateFeatureStatus(feature.id, 'enterprise', checked as boolean)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {features.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No features defined
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure global system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
