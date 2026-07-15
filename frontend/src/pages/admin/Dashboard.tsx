import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDashboardStats } from '../../services/dashboardService';
import { Card, Spinner, PageHeader } from '../../components/ui';

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });

  if (isLoading || !data) return <Spinner />;

  const { stats, charts } = data;
  const chartData = charts.labels.map((label, i) => ({
    label,
    visitors: charts.visitors[i],
    revenue: charts.revenue[i],
    orders: charts.orders[i],
  }));

  const cards = [
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Total Visitors', value: stats.totalVisitors.toLocaleString() },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString() },
    { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}` },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold">{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Visitors (last 7 months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="visitors" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Revenue (last 7 months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Visitors, orders, and revenue figures are illustrative placeholder data. Product and category counts are live.
      </p>
    </div>
  );
}
