import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDashboardStats } from '../../services/dashboardService';
import { getProducts } from '../../services/productService';
import { Card, PageHeader, Spinner } from '../../components/ui';

export default function Analytics() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });
  const { data: topProducts } = useQuery({
    queryKey: ['analytics-top-products'],
    queryFn: () => getProducts({ sort: 'featured', limit: 5, includeUnpublished: true }),
  });

  if (isLoading || !data) return <Spinner />;

  const chartData = data.charts.labels.map((label, i) => ({
    label,
    visitors: data.charts.visitors[i],
    orders: data.charts.orders[i],
  }));

  return (
    <div>
      <PageHeader title="Analytics" />
      <p className="mb-4 text-xs text-gray-400">Visitor/order trends use placeholder data until real tracking is wired up.</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Visitors</h3>
          <ResponsiveContainer width="100%" height={250}>
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
          <h3 className="mb-4 font-semibold">Orders</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="orders" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold">Top Selling Products</h3>
          <ul className="divide-y divide-gray-100 text-sm">
            {topProducts?.products.map((p) => (
              <li key={p._id} className="flex items-center justify-between py-2">
                <span>{p.name}</span>
                <span className="text-gray-500">${p.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
