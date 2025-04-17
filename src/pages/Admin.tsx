
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LawFirm, UserProfile } from "@/types";
import { Loader2, Plus, Building, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firms, setFirms] = useState<LawFirm[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    checkUserRole();
    fetchLawFirms();
    fetchUsers();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You need to be logged in to access this page");
        navigate('/');
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
          settings: firm.settings,
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
        })) as UserProfile[];
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">System Administration</h1>
            <p className="text-muted-foreground">Manage law firms, users, and system settings</p>
          </div>

          <Tabs defaultValue="firms" className="mb-6">
            <TabsList>
              <TabsTrigger value="firms">
                <Building className="mr-2 h-4 w-4" />
                Law Firms
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
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
                    <Button className="bg-law-teal hover:bg-law-teal/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Firm
                    </Button>
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
                              <Badge variant={firm.subscriptionStatus === 'active' ? 'default' : 'destructive'}>
                                {firm.subscriptionStatus}
                              </Badge>
                            </td>
                            <td className="px-2 text-sm">
                              {firm.contactEmail && <div>{firm.contactEmail}</div>}
                              {firm.contactPhone && <div>{firm.contactPhone}</div>}
                            </td>
                            <td className="px-2 text-right">
                              <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive">Disable</Button>
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
                    <Button className="bg-law-teal hover:bg-law-teal/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New User
                    </Button>
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
          </Tabs>
        </main>
      </div>
    </div>
  );
}
