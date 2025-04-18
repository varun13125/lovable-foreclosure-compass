
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LawFirm, UserProfile } from "@/types";
import { 
  Loader2, 
  Plus, 
  Building, 
  Users, 
  Shield, 
  Key, 
  Check,
  X,
  AlertTriangle,
  RefreshCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MasterAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("firms");
  
  // Firms management
  const [firms, setFirms] = useState<LawFirm[]>([]);
  const [newFirmOpen, setNewFirmOpen] = useState(false);
  const [newFirmName, setNewFirmName] = useState("");
  const [newFirmEmail, setNewFirmEmail] = useState("");
  const [newFirmTier, setNewFirmTier] = useState("basic");
  
  // Users management
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserFirm, setNewUserFirm] = useState("");
  const [newUserRole, setNewUserRole] = useState("staff");
  
  // Permission management
  const [features, setFeatures] = useState<any[]>([]);
  const [editFeaturesOpen, setEditFeaturesOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<any>(null);
  
  // Initial load
  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    if (userRole === 'system_admin') {
      if (selectedTab === 'firms') fetchLawFirms();
      if (selectedTab === 'users') fetchUsers();
      if (selectedTab === 'permissions') fetchFeatures();
    }
  }, [selectedTab, userRole]);

  const checkUserRole = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You need to be logged in to access this page");
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserRole(data.role);
        // If user is not a system_admin, redirect them
        if (data.role !== 'system_admin') {
          toast.error("You don't have permission to access this page");
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      toast.error("Error checking permissions");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchLawFirms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('law_firms')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedFirms: LawFirm[] = data.map(firm => ({
          id: firm.id,
          name: firm.name,
          subscriptionTier: firm.subscription_tier,
          subscriptionStatus: firm.subscription_status,
          subscriptionStartDate: firm.subscription_start_date,
          subscriptionEndDate: firm.subscription_end_date,
          settings: firm.settings as Record<string, any>,
          logoUrl: firm.logo_url,
          contactEmail: firm.contact_email,
          contactPhone: firm.contact_phone,
          address: firm.address,
          enabled: firm.enabled,
          createdAt: firm.created_at,
          updatedAt: firm.updated_at
        }));
        setFirms(formattedFirms);
      }
    } catch (error) {
      console.error("Error fetching law firms:", error);
      toast.error("Failed to load law firms");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          created_at,
          updated_at,
          avatar_url,
          law_firm_id,
          law_firms (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedUsers: UserProfile[] = data.map(user => ({
          id: user.id,
          firstName: user.first_name || undefined,
          lastName: user.last_name || undefined,
          email: user.email,
          role: user.role,
          lawFirmId: user.law_firm_id || undefined,
          avatarUrl: user.avatar_url || undefined,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lawFirmName: user.law_firms?.name
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('name');

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error("Error fetching features:", error);
      toast.error("Failed to load features");
    } finally {
      setLoading(false);
    }
  };

  const createNewFirm = async () => {
    if (!newFirmName || !newFirmEmail) {
      toast.error("Please provide a firm name and contact email");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('law_firms')
        .insert([
          {
            name: newFirmName,
            contact_email: newFirmEmail,
            subscription_tier: newFirmTier,
            subscription_status: 'active',
            enabled: true
          }
        ])
        .select();

      if (error) throw error;

      toast.success(`Law firm "${newFirmName}" created successfully`);
      setNewFirmOpen(false);
      setNewFirmName("");
      setNewFirmEmail("");
      setNewFirmTier("basic");
      fetchLawFirms();
    } catch (error) {
      console.error("Error creating firm:", error);
      toast.error("Failed to create firm");
    }
  };

  const createNewUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserFirm) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // First register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            first_name: newUserFirstName,
            last_name: newUserLastName,
          }
        }
      });

      if (authError) throw authError;
      
      if (authData.user) {
        // Update the user's profile with firm and role information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            law_firm_id: newUserFirm,
            role: newUserRole,
            first_name: newUserFirstName,
            last_name: newUserLastName
          })
          .eq('id', authData.user.id);
          
        if (profileError) throw profileError;
        
        toast.success(`User ${newUserEmail} created successfully`);
        setNewUserOpen(false);
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserFirstName("");
        setNewUserLastName("");
        setNewUserFirm("");
        setNewUserRole("staff");
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    }
  };

  const updateFeaturePermissions = async () => {
    if (!currentFeature) return;
    
    try {
      const { error } = await supabase
        .from('features')
        .update({
          basic_enabled: currentFeature.basic_enabled,
          standard_enabled: currentFeature.standard_enabled,
          premium_enabled: currentFeature.premium_enabled,
          enterprise_enabled: currentFeature.enterprise_enabled
        })
        .eq('id', currentFeature.id);

      if (error) throw error;
      
      toast.success(`Permissions for "${currentFeature.name}" updated`);
      setEditFeaturesOpen(false);
      fetchFeatures();
    } catch (error) {
      console.error("Error updating feature permissions:", error);
      toast.error("Failed to update permissions");
    }
  };

  const toggleFirmStatus = async (firmId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('law_firms')
        .update({ enabled: !currentStatus })
        .eq('id', firmId);
      
      if (error) throw error;
      
      toast.success(`Firm ${currentStatus ? 'disabled' : 'enabled'} successfully`);
      fetchLawFirms();
    } catch (error) {
      console.error("Error toggling firm status:", error);
      toast.error("Failed to update firm status");
    }
  };

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-500';
      case 'standard': return 'bg-blue-500';
      case 'premium': return 'bg-purple-500';
      case 'enterprise': return 'bg-law-teal';
      default: return 'bg-gray-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:pl-64">
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-law-teal" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Master Administration</h1>
            <p className="text-muted-foreground">Manage law firms, users, and system permissions</p>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="firms">
                <Building className="mr-2 h-4 w-4" />
                Law Firms
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="permissions">
                <Shield className="mr-2 h-4 w-4" />
                Permissions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="firms" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Law Firms</CardTitle>
                      <CardDescription>Manage law firms and their subscription tiers</CardDescription>
                    </div>
                    <Dialog open={newFirmOpen} onOpenChange={setNewFirmOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-law-teal hover:bg-law-teal/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Firm
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Law Firm</DialogTitle>
                          <DialogDescription>
                            Create a new law firm account in the system.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="firm-name">Firm Name</Label>
                            <Input 
                              id="firm-name"
                              value={newFirmName}
                              onChange={(e) => setNewFirmName(e.target.value)}
                              placeholder="Enter firm name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="firm-email">Contact Email</Label>
                            <Input 
                              id="firm-email"
                              type="email"
                              value={newFirmEmail}
                              onChange={(e) => setNewFirmEmail(e.target.value)}
                              placeholder="contact@lawfirm.com"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="firm-tier">Subscription Tier</Label>
                            <Select 
                              value={newFirmTier}
                              onValueChange={setNewFirmTier}
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
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewFirmOpen(false)}>
                            Cancel
                          </Button>
                          <Button className="bg-law-teal hover:bg-law-teal/90" onClick={createNewFirm}>
                            Create Firm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left font-medium">Firm Name</th>
                          <th className="h-10 px-2 text-left font-medium">Subscription</th>
                          <th className="h-10 px-2 text-left font-medium">Status</th>
                          <th className="h-10 px-2 text-left font-medium">Contacts</th>
                          <th className="h-10 px-2 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {firms.map((firm) => (
                          <tr key={firm.id} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-medium">{firm.name}</td>
                            <td className="px-2">
                              <Badge className={getSubscriptionBadgeColor(firm.subscriptionTier)}>
                                {firm.subscriptionTier.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-2">
                              <Badge variant={firm.enabled ? 'default' : 'destructive'}>
                                {firm.enabled ? 'ACTIVE' : 'DISABLED'}
                              </Badge>
                            </td>
                            <td className="px-2 text-sm">
                              {firm.contactEmail && <div>{firm.contactEmail}</div>}
                              {firm.contactPhone && <div>{firm.contactPhone}</div>}
                            </td>
                            <td className="px-2 text-right">
                              <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                              <Button 
                                variant={firm.enabled ? "destructive" : "default"} 
                                size="sm"
                                onClick={() => toggleFirmStatus(firm.id, firm.enabled)}
                              >
                                {firm.enabled ? 'Disable' : 'Enable'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Users</CardTitle>
                      <CardDescription>Manage system users and their roles</CardDescription>
                    </div>
                    <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-law-teal hover:bg-law-teal/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Add New User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                          <DialogDescription>
                            Create a new user account with specified access level.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="first-name">First Name</Label>
                              <Input 
                                id="first-name"
                                value={newUserFirstName}
                                onChange={(e) => setNewUserFirstName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="last-name">Last Name</Label>
                              <Input 
                                id="last-name"
                                value={newUserLastName}
                                onChange={(e) => setNewUserLastName(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="user-email">Email</Label>
                            <Input 
                              id="user-email"
                              type="email"
                              value={newUserEmail}
                              onChange={(e) => setNewUserEmail(e.target.value)}
                              placeholder="user@example.com"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="user-password">Password</Label>
                            <Input 
                              id="user-password"
                              type="password"
                              value={newUserPassword}
                              onChange={(e) => setNewUserPassword(e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="user-firm">Law Firm</Label>
                            <Select 
                              value={newUserFirm}
                              onValueChange={setNewUserFirm}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select law firm" />
                              </SelectTrigger>
                              <SelectContent>
                                {firms.map(firm => (
                                  <SelectItem key={firm.id} value={firm.id}>
                                    {firm.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="user-role">Role</Label>
                            <Select 
                              value={newUserRole}
                              onValueChange={setNewUserRole}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select user role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="system_admin">System Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewUserOpen(false)}>
                            Cancel
                          </Button>
                          <Button className="bg-law-teal hover:bg-law-teal/90" onClick={createNewUser}>
                            Create User
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
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
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="px-2">{user.lawFirmName || 'N/A'}</td>
                            <td className="px-2 text-right">
                              <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="permissions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Permissions</CardTitle>
                  <CardDescription>
                    Control which features are available to each subscription tier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left font-medium">Feature</th>
                          <th className="h-10 px-2 text-center font-medium">Basic</th>
                          <th className="h-10 px-2 text-center font-medium">Standard</th>
                          <th className="h-10 px-2 text-center font-medium">Premium</th>
                          <th className="h-10 px-2 text-center font-medium">Enterprise</th>
                          <th className="h-10 px-2 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {features.map((feature) => (
                          <tr key={feature.id} className="border-b hover:bg-muted/50">
                            <td className="p-4 font-medium">
                              {feature.name}
                              {feature.description && (
                                <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                              )}
                            </td>
                            <td className="px-2 text-center">
                              {feature.basic_enabled ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </td>
                            <td className="px-2 text-center">
                              {feature.standard_enabled ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </td>
                            <td className="px-2 text-center">
                              {feature.premium_enabled ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </td>
                            <td className="px-2 text-center">
                              {feature.enterprise_enabled ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </td>
                            <td className="px-2 text-right">
                              <Dialog 
                                open={editFeaturesOpen && currentFeature?.id === feature.id} 
                                onOpenChange={(open) => {
                                  setEditFeaturesOpen(open);
                                  if (open) setCurrentFeature({...feature});
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Key className="mr-2 h-4 w-4" />
                                    Edit Access
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Feature Access</DialogTitle>
                                    <DialogDescription>
                                      Determine which subscription tiers have access to {feature.name}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {currentFeature && (
                                    <div className="space-y-4 py-4">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox 
                                          id="basic" 
                                          checked={currentFeature.basic_enabled}
                                          onCheckedChange={(checked) => 
                                            setCurrentFeature({
                                              ...currentFeature, 
                                              basic_enabled: checked === true
                                            })
                                          }
                                        />
                                        <Label htmlFor="basic">
                                          Basic Tier Access
                                        </Label>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        <Checkbox 
                                          id="standard" 
                                          checked={currentFeature.standard_enabled}
                                          onCheckedChange={(checked) => 
                                            setCurrentFeature({
                                              ...currentFeature, 
                                              standard_enabled: checked === true
                                            })
                                          }
                                        />
                                        <Label htmlFor="standard">
                                          Standard Tier Access
                                        </Label>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        <Checkbox 
                                          id="premium" 
                                          checked={currentFeature.premium_enabled}
                                          onCheckedChange={(checked) => 
                                            setCurrentFeature({
                                              ...currentFeature, 
                                              premium_enabled: checked === true
                                            })
                                          }
                                        />
                                        <Label htmlFor="premium">
                                          Premium Tier Access
                                        </Label>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        <Checkbox 
                                          id="enterprise" 
                                          checked={currentFeature.enterprise_enabled}
                                          onCheckedChange={(checked) => 
                                            setCurrentFeature({
                                              ...currentFeature, 
                                              enterprise_enabled: checked === true
                                            })
                                          }
                                        />
                                        <Label htmlFor="enterprise">
                                          Enterprise Tier Access
                                        </Label>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditFeaturesOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      className="bg-law-teal hover:bg-law-teal/90" 
                                      onClick={updateFeaturePermissions}
                                    >
                                      Save Changes
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={fetchFeatures}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button className="bg-law-teal hover:bg-law-teal/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Feature
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
