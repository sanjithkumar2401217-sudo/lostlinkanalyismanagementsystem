import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { ItemRecord } from '../types';
// FIX: Replaced `sub` with `subMonths` to resolve an error where `sub` is not an exported member of `date-fns`.
import { subMonths, format } from 'date-fns';

interface DashboardProps {
  items: ItemRecord[];
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-slate-800 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
            <div className="p-3 text-white rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-md">
                {icon}
            </div>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ items }) => {
    const totalLost = items.filter(item => item.type === 'Lost').length;
    const totalFound = items.filter(item => item.type === 'Found').length;
    const totalClaimed = items.filter(item => item.status === 'Claimed' || item.status === 'Returned').length;
    const totalPending = items.filter(item => item.status === 'Pending').length;

    const statusData = [
        { name: 'Pending', value: totalPending },
        { name: 'Claimed/Returned', value: totalClaimed },
        { name: 'Matched', value: items.filter(item => item.status === 'Matched').length },
    ];

    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(new Date(), 5 - i);
        return {
            name: format(date, 'MMM'),
            Lost: 0,
            Found: 0,
        };
    });

    items.forEach(item => {
        const month = format(new Date(item.date), 'MMM');
        const monthIndex = monthlyData.findIndex(d => d.name === month);
        if (monthIndex !== -1) {
            monthlyData[monthIndex][item.type]++;
        }
    });

    const COLORS = ['#FFBB28', '#00C49F', '#0088FE'];

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Lost Items" value={totalLost} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16-4-4-4 4"/><path d="m22 10-4.5 4.5-.7.7"/><path d="m2 14 6 6h12v-4"/><path d="m18 4-4 4"/><path d="m14 10-1.5 1.5"/><path d="M11 13 2 22"/><path d="m2 10 4.5-4.5.7-.7"/></svg>} />
                <StatCard title="Total Found Items" value={totalFound} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 16 4-4 4 4"/><path d="M12 2v8"/><path d="m2 14 6 6h12v-4"/><path d="M14 10 2 22"/><path d="m22 2-5 5"/></svg>} />
                <StatCard title="Items Claimed" value={totalClaimed} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>} />
                <StatCard title="Pending Items" value={totalPending} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow-md dark:bg-slate-800">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Items Reported Over Last 6 Months</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.3)" />
                            <XAxis dataKey="name" tick={{ fill: 'rgb(100 116 139)' }} />
                            <YAxis tick={{ fill: 'rgb(100 116 139)' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="Lost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Found" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-md dark:bg-slate-800">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Item Status Distribution</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                  // FIX: Add type assertions to the label props to resolve arithmetic operation errors on unknown types.
                                  const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.5;
                                  const x = (cx as number) + radius * Math.cos(-(midAngle as number) * (Math.PI / 180));
                                  const y = (cy as number) + radius * Math.sin(-(midAngle as number) * (Math.PI / 180));
                                  return (
                                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                      {`${((percent as number) * 100).toFixed(0)}%`}
                                    </text>
                                  );
                                }}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;