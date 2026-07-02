import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    CartesianGrid,
    Legend,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";
const CustomerAnalysis = () => {
    const COLORS = [
        "#22c55e",
        "#3b82f6",
        "#f97316",
        "#7c3aed",
    ];
    const [dashboard, setDashboard] = useState({});
    const [topCustomers, setTopCustomers] = useState([]);
    const [segments, setSegments] = useState([]);
    const [growth, setGrowth] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [regions, setRegions] = useState([]);
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [
                dashboardRes,
                topRes,
                segmentRes,
                growthRes,
                customerRes,
                regionRes
            ] = await Promise.all([
                axiosInstance.get("/customers/dashboard"),
                axiosInstance.get("/customers/top-customers"),
                axiosInstance.get("/customers/segments"),
                axiosInstance.get("/customers/growth"),
                axiosInstance.get("/customers/all-customers"),
                axiosInstance.get("/customers/by-region")
            ]);

            setDashboard(dashboardRes.data);
            setTopCustomers(topRes.data);
            setSegments(segmentRes.data);
            setGrowth(growthRes.data);
            setCustomers(customerRes.data);
            setRegions(regionRes.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-xl">
                Loading Customer Analytics...
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">
                Customer Analysis
            </h1>
            <div className="grid grid-cols-4 gap-6 mb-8">

                <div className="bg-white rounded-xl shadow p-6">
                    <p className="text-gray-500">
                        Total Customers
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {dashboard.totalCustomers}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <p className="text-gray-500">
                        Repeat Customers
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-green-600">
                        {dashboard.repeatCustomers}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <p className="text-gray-500">
                        Average Spend
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-violet-600">
                        ₹{dashboard.averageSpend?.toFixed(0)}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
  <p className="text-gray-500">
    Premium Customers
  </p>

  <h2 className="text-3xl font-bold mt-2 text-orange-600">
    {dashboard.premiumCustomers ?? 0}
  </h2>
</div>

            </div>
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-6">

                    <div>
                        <h2 className="text-2xl font-semibold">
                            Top Customers by Revenue
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Top 10 customers ranked by total revenue generated.
                        </p>
                    </div>

                    <div className="text-sm text-gray-500">
                        Showing {topCustomers.length} Customers
                    </div>

                </div>

                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={topCustomers}
                        margin={{
                            top: 10,
                            right: 20,
                            left: 20,
                            bottom: 60,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="_id"
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                            height={70}
                            tick={{ fontSize: 12 }}
                            label={{
                                value: "Customers",
                                position: "insideBottom",
                                offset: -5,
                            }}
                        />

                        <YAxis
                            tick={{ fontSize: 12 }}
                            label={{
                                value: "Revenue (₹)",
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />

                        <Tooltip
                            formatter={(value) => [
                                `₹${value.toLocaleString()}`,
                                "Revenue",
                            ]}
                        />

                        <Bar
                            dataKey="revenue"
                            fill="#7c3aed"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>


           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

  {/* Customer Growth */}
  <div className="bg-white rounded-3xl shadow-lg p-6">

    <div className="mb-6">
      <h2 className="text-2xl font-semibold">
        Customer Growth
      </h2>

      <p className="text-gray-500 text-sm">
        Number of unique customers acquired over time.
      </p>
    </div>

    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={growth}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
        />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="totalCustomers"
          stroke="#7c3aed"
          strokeWidth={3}
        />

      </LineChart>
    </ResponsiveContainer>

  </div>

  {/* Customer Segmentation */}
  <div className="bg-white rounded-3xl shadow-lg p-6">

    <div className="flex justify-between items-center mb-6">

      <div>
        <h2 className="text-2xl font-semibold">
          Customer Segmentation
        </h2>

        <p className="text-gray-500 text-sm">
          Distribution based on customer spending.
        </p>
      </div>

      <span className="text-gray-500 text-sm">
        {segments.reduce((sum, item) => sum + item.value, 0)} Customers
      </span>

    </div>

    <ResponsiveContainer width="100%" height={320}>

      <PieChart>

        <Pie
          data={segments}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={110}
          innerRadius={55}
          label
        >
          {segments.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip />

        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
        />

      </PieChart>

    </ResponsiveContainer>

    <div className="grid grid-cols-3 gap-4 mt-6">

      {segments.map((item, index) => (

        <div
          key={index}
          className="rounded-xl p-4 text-center"
          style={{
            backgroundColor:
              COLORS[index % COLORS.length] + "20",
          }}
        >
          <p
            className="font-semibold"
            style={{
              color: COLORS[index % COLORS.length],
            }}
          >
            {item.name}
          </p>

          <h2
            className="text-3xl font-bold"
            style={{
              color: COLORS[index % COLORS.length],
            }}
          >
            {item.value}
          </h2>

        </div>

      ))}

    </div>

  </div>

</div>
        </div>
    );
};

export default CustomerAnalysis;