import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import Footer from '../../components/common/Footer';
import Badge from '../../components/common/Badge';

const EarningsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/payments/lister-earnings/');
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch earnings:', err);
            setError('Failed to load earnings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-offwhite pt-32 px-6 lg:px-12 animate-pulse">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="h-20 w-1/3 bg-gray-200 rounded-2xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-premium" />)}
                    </div>
                    <div className="h-[400px] bg-gray-200 rounded-premium" />
                    <div className="h-80 bg-gray-200 rounded-premium" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h1 className="text-2xl font-black mb-4 text-brand-gray-dark">{error}</h1>
                <button
                    onClick={fetchEarnings}
                    className="bg-brand-blue-primary text-white font-black py-3 px-8 rounded-radius-button hover:bg-brand-blue-dark transition-all shadow-lg active:scale-95"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const { total_earned, payments, monthly_summary } = data;
    const totalBookings = payments.length;
    const avgPerBooking = totalBookings > 0 ? total_earned / totalBookings : 0;

    if (totalBookings === 0) {
        return (
            <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">
                <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                    <Link to="/lister/dashboard" className="text-sm font-bold text-brand-blue-primary hover:underline mb-8 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <div className="mb-12">
                        <h1 className="text-4xl font-black tracking-tighter leading-none mb-2">My Earnings Dashboard</h1>
                        <p className="text-sm text-brand-gray-medium font-medium">Track your rental income and bookings</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-premium border border-brand-gray-light shadow-sm p-12">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 text-emerald-500">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-3xl font-black mb-4">No earnings yet.</h2>
                        <p className="text-brand-gray-medium font-medium max-w-md mx-auto">
                            Once tenants pay advance for your properties, they'll appear here with detailed financial breakdowns.
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">
            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                {/* Header Section */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <Link to="/lister/dashboard" className="text-sm font-bold text-brand-blue-primary hover:underline mb-4 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black tracking-tighter leading-none mb-2">My Earnings Dashboard</h1>
                        <p className="text-sm text-brand-gray-medium font-medium">Track your rental income and bookings</p>
                    </div>
                    <Badge variant="neutral" className="bg-brand-gray-light/30 text-brand-gray-dark font-black tracking-widest uppercase py-1 px-4">Lister Portal</Badge>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Total Earned */}
                    <div className="bg-white rounded-premium border border-brand-gray-light shadow-sm p-8 flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black tracking-widest text-brand-gray-medium uppercase mb-1">Total Earned</p>
                            <h3 className="text-3xl font-black text-emerald-600 leading-none">{formatCurrency(total_earned)}</h3>
                        </div>
                    </div>

                    {/* Total Bookings */}
                    <div className="bg-white rounded-premium border border-brand-gray-light shadow-sm p-8 flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-brand-blue-primary shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black tracking-widest text-brand-gray-medium uppercase mb-1">Total Bookings</p>
                            <h3 className="text-3xl font-black text-brand-blue-primary leading-none">{totalBookings}</h3>
                        </div>
                    </div>

                    {/* Avg Per Booking */}
                    <div className="bg-white rounded-premium border border-brand-gray-light shadow-sm p-8 flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-brand-gray-dark shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" /></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black tracking-widest text-brand-gray-medium uppercase mb-1">Avg Per Booking</p>
                            <h3 className="text-3xl font-black text-brand-gray-dark leading-none">{formatCurrency(avgPerBooking)}</h3>
                        </div>
                    </div>
                </div>

                {/* Monthly Chart Section */}
                <div className="bg-white border border-brand-gray-light rounded-premium p-10 mb-12 shadow-sm">
                    <h3 className="text-2xl font-black mb-10">Monthly Earnings</h3>
                    {monthly_summary.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthly_summary}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 900, fill: '#6B7280' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 900, fill: '#6B7280' }}
                                        tickFormatter={value => '₹' + (value / 1000) + 'k'}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-brand-gray-dark text-white p-4 rounded-xl shadow-2xl border-none">
                                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60 text-center">{payload[0].payload.month}</p>
                                                        <p className="text-lg font-black">{formatCurrency(payload[0].value)}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-sm text-brand-gray-medium italic text-center py-12">No earnings data yet.</p>
                    )}
                </div>

                {/* Payments Table */}
                <div className="bg-white border border-brand-gray-light rounded-premium overflow-hidden shadow-sm">
                    <div className="p-10 border-b border-brand-gray-light flex items-center justify-between">
                        <h3 className="text-2xl font-black">All Bookings</h3>
                        <Badge variant="accent" className="bg-emerald-50 text-emerald-700 font-black px-4">{totalBookings} Confirmed</Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full border-collapse text-left">
                            <thead className="bg-brand-offwhite">
                                <tr>
                                    <th className="px-10 py-5 text-[10px] font-black tracking-widest uppercase text-brand-gray-medium">Property</th>
                                    <th className="px-10 py-5 text-[10px] font-black tracking-widest uppercase text-brand-gray-medium">Tenant</th>
                                    <th className="px-10 py-5 text-[10px] font-black tracking-widest uppercase text-brand-gray-medium">Amount</th>
                                    <th className="px-10 py-5 text-[10px] font-black tracking-widest uppercase text-brand-gray-medium text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium">
                                {payments.length > 0 ? payments.map((p, idx) => (
                                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-brand-offwhite/50'} hover:bg-brand-blue-primary/5 transition-colors group`}>
                                        <td className="px-10 py-6">
                                            <p className="font-black text-brand-gray-dark group-hover:text-brand-blue-primary transition-colors">{p.property_title}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-brand-gray-medium font-bold">{p.paid_by || p.tenant_email}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-emerald-600 font-black">{formatCurrency(p.amount)}</p>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <p className="text-brand-gray-medium font-bold">{formatDate(p.paid_at)}</p>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-12 text-center italic text-brand-gray-medium">
                                            No bookings received yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default EarningsDashboard;
