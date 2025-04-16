
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function CaseForm() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Create New Case</CardTitle>
        <CardDescription>
          Enter the details for a new foreclosure case
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="mortgage">Mortgage</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fileNumber">File Number</Label>
                <Input id="fileNumber" placeholder="e.g. FC-2023-005" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Demand Letter Sent">Demand Letter Sent</SelectItem>
                    <SelectItem value="Petition Filed">Petition Filed</SelectItem>
                    <SelectItem value="Order Nisi Granted">Order Nisi Granted</SelectItem>
                    <SelectItem value="Redemption Period">Redemption Period</SelectItem>
                    <SelectItem value="Sale Process">Sale Process</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Add any notes about this case" />
              </div>
            </div>
          </TabsContent>

          {/* Property Tab */}
          <TabsContent value="property">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="street">Street Address</Label>
                <Input id="street" placeholder="Street address" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="province">Province</Label>
                  <Select defaultValue="BC">
                    <SelectTrigger id="province">
                      <SelectValue placeholder="Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BC">British Columbia</SelectItem>
                      <SelectItem value="AB">Alberta</SelectItem>
                      <SelectItem value="ON">Ontario</SelectItem>
                      {/* More provinces would go here */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" placeholder="e.g. V6B 2W9" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pid">Property ID (PID)</Label>
                <Input id="pid" placeholder="e.g. 012-345-678" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="legalDescription">Legal Description</Label>
                <Textarea id="legalDescription" placeholder="Enter legal description of property" />
              </div>
            </div>
          </TabsContent>
          
          {/* Mortgage Tab */}
          <TabsContent value="mortgage">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input id="registrationNumber" placeholder="e.g. CA123456" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="principal">Principal Amount</Label>
                  <Input id="principal" placeholder="e.g. 450000" type="number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input id="interestRate" placeholder="e.g. 4.5" type="number" step="0.01" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentBalance">Current Balance</Label>
                  <Input id="currentBalance" placeholder="e.g. 410350.22" type="number" step="0.01" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="paymentAmount">Payment Amount</Label>
                  <Input id="paymentAmount" placeholder="e.g. 2275.33" type="number" step="0.01" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                  <Select>
                    <SelectTrigger id="paymentFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="arrears">Arrears Amount</Label>
                  <Input id="arrears" placeholder="e.g. 12000" type="number" step="0.01" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="perDiemInterest">Per Diem Interest</Label>
                  <Input id="perDiemInterest" placeholder="e.g. 50.55" type="number" step="0.01" />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Parties Tab */}
          <TabsContent value="parties">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 pb-6">
                <h3 className="font-medium mb-3">Borrower Information</h3>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="borrowerName">Full Name</Label>
                    <Input id="borrowerName" placeholder="Full legal name" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="borrowerEmail">Email</Label>
                      <Input id="borrowerEmail" type="email" placeholder="Email address" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="borrowerPhone">Phone</Label>
                      <Input id="borrowerPhone" placeholder="Phone number" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 pb-6">
                <h3 className="font-medium mb-3">Lender Information</h3>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="lenderName">Institution Name</Label>
                    <Input id="lenderName" placeholder="Financial institution name" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="lenderEmail">Email</Label>
                      <Input id="lenderEmail" type="email" placeholder="Email address" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lenderPhone">Phone</Label>
                      <Input id="lenderPhone" placeholder="Phone number" />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Add Additional Party
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-law-teal hover:bg-law-teal/90">Create Case</Button>
      </CardFooter>
    </Card>
  );
}
