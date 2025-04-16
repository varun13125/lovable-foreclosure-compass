
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { mockCases } from "@/data/mockData";

export default function CaseStatusChart() {
  // Group cases by status and count
  const statusCounts = mockCases.reduce((acc, curr) => {
    const status = curr.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Transform to chart data
  const data = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Define colors for each status
  const COLORS = {
    'New': '#4299e1', 
    'Demand Letter Sent': '#d69e2e',
    'Petition Filed': '#805ad5',
    'Order Nisi Granted': '#38b2ac',
    'Redemption Period': '#ed8936',
    'Sale Process': '#667eea',
    'Closed': '#48bb78'
  };

  const defaultColors = ['#4299e1', '#d69e2e', '#805ad5', '#38b2ac', '#ed8936', '#667eea', '#48bb78'];

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Case Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS] || defaultColors[index % defaultColors.length]} 
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
