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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 text-xl text-center md:text-left text-gray-600 font-medium">
                Loading Customer Analytics...
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-800">
                Customer Analysis
            </h1>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-white rounded-xl shadow p-5 md:p-6">
                    <p className="text-gray-500 text-sm font-medium">Total Customers</p>
                    <h2 className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">
                        {dashboard.totalCustomers}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow p-5 md:p-6">
                    <p className="text-gray-500 text-sm font-medium">Repeat Customers</p>
                    <h2 className="text-2xl md:text-3xl font-bold mt-2 text-green-600">
                        {dashboard.repeatCustomers}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow p-5 md:p-6">
                    <p className="text-gray-500 text-sm font-medium">Average Spend</p>
                    <h2 className="text-2xl md:text-3xl font-bold mt-2 text-violet-600">
                        ₹{dashboard.averageSpend?.toFixed(0)}
                    </h2>
                </div>

                <div className="bg-white rounded-xl shadow p-5 md:p-6">
                    <p className="text-gray-500 text-sm font-medium">Premium Customers</p>
                    <h2 className="text-2xl md:text-3xl font-bold mt-2 text-orange-600">
                        {dashboard.premiumCustomers ?? 0}
                    </h2>
                </div>
            </div>

            {/* Top Customers Bar Chart */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                            Top Customers by Revenue
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                            Top 10 customers ranked by total revenue generated.
                        </p>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 self-end sm:self-center">
                        Showing {topCustomers.length} Customers
                    </div>
                </div>

                {/* Horizontal overflow safety wrapper for small viewports */}
                <div className="w-full overflow-x-auto overflow-y-hidden">
                    <div className="min-w-[600px] h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={topCustomers}
                                margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="_id"
                                    angle={-35}
                                    textAnchor="end"
                                    interval={0}
                                    height={60}
                                    tick={{ fontSize: 11 }}
                                    label={{
                                        value: "Customers",
                                        position: "insideBottom",
                                        offset: -25,
                                    }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    label={{
                                        value: "Revenue (₹)",
                                        angle: -90,
                                        position: "insideLeft",
                                        offset: 0
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
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Split Grid for Lower Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Customer Growth Line Chart */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-6">
                    <div className="mb-6">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                            Customer Growth
                        </h2>
                        <p className="text-gray-500 text-xs md:text-sm">
                            Number of unique customers acquired over time.
                        </p>
                    </div>

                    <div className="w-full overflow-x-auto overflow-y-hidden">
                        <div className="min-w-[450px] h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growth} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
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
                    </div>
                </div>

                {/* Customer Segmentation Pie Chart */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                                Customer Segmentation
                            </h2>
                            <p className="text-gray-500 text-xs md:text-sm">
                                Distribution based on customer spending.
                            </p>
                        </div>
                        <span className="text-gray-500 text-xs md:text-sm font-medium">
                            {Array.isArray(segments) ? segments.reduce((sum, item) => sum + item.value, 0) : 0} Customers
                        </span>
                    </div>

                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={segments}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="45%"
                                    outerRadius={95}
                                    innerRadius={50}
                                    labelLine={false}
                                >
                                    {Array.isArray(segments) &&
                                        segments.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Segment breakdown blocks */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {Array.isArray(segments) &&
                            segments.map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl p-3 text-center"
                                    style={{
                                        backgroundColor: COLORS[index % COLORS.length] + "15",
                                    }}
                                >
                                    <p
                                        className="font-medium text-xs md:text-sm truncate"
                                        style={{ color: COLORS[index % COLORS.length] }}
                                    >
                                        {item.name}
                                    </p>
                                    <h2
                                        className="text-xl md:text-2xl font-bold mt-1"
                                        style={{ color: COLORS[index % COLORS.length] }}
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