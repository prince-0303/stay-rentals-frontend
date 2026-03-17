import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { propertyService } from '../../services/propertyService';
import { getProfile } from '../../services/authService';
import ListerStats from '../../components/lister/StatsCard';
import ListingsTable from '../../components/lister/ListingsTable';
import LeadsBoard from '../../components/lister/LeadGraph';

const ListerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState([]);
    const [visitRequests, setVisitRequests] = useState([]);
    const [updatingReqId, setUpdatingReqId] = useState(null);

    // Analytics state
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const profile = await getProfile();
                setUser(profile);

                // Fetch properties and visit requests concurrently
                const [propsRes, visitsRes] = await Promise.all([
                    propertyService.getMyProperties(),
                    propertyService.getVisitRequests()
                ]);

                const fetchedProps = Array.isArray(propsRes) ? propsRes : (propsRes.results || []);
                const fetchedVisits = Array.isArray(visitsRes) ? visitsRes : (visitsRes.results || []);

                setProperties(fetchedProps);
                setVisitRequests(fetchedVisits);

                // Calculate Analytics
                const totalLeads = fetchedVisits.length;
                const activeCount = fetchedProps.filter(p => p.status === 'Active' || p.status === 'active' || p.is_active || p.is_featured).length;
                const totalProps = fetchedProps.length;
                const healthString = totalProps > 0 ? `${activeCount}/${totalProps} Active` : '0 Active';

                // A simulated "Weekly Reach" or similar fallback metric
                const reach = totalLeads * 14 + activeCount * 45;

                setStats([
                    { label: 'Total Leads', value: String(totalLeads), change: '+New', color: 'from-brand-blue-primary to-brand-blue-dark' },
                    { label: 'Listing Health', value: healthString, change: 'Steady', color: 'from-brand-accent to-yellow-600' },
                    { label: 'Weekly Reach', value: `${reach}`, change: '+Engaged', color: 'from-brand-gray-dark to-brand-gray-light' }
                ]);

            } catch (error) {
                console.error("Dashboard check failed:", error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleUpdateVisit = async (requestId, propertyId, newStatus) => {
        try {
            setUpdatingReqId(requestId);
            await propertyService.updateVisitRequest(propertyId, requestId, newStatus);
            // Refresh dashboard data to show updated state
            const propsRes = await propertyService.getMyProperties();
            const visitsRes = await propertyService.getVisitRequests();
            const fetchedProps = Array.isArray(propsRes) ? propsRes : (propsRes.results || []);
            const fetchedVisits = Array.isArray(visitsRes) ? visitsRes : (visitsRes.results || []);
            setProperties(fetchedProps);
            setVisitRequests(fetchedVisits);
        } catch (error) {
            console.error("Failed to update visit request:", error);
            alert("Failed to update request. Please try again.");
        } finally {
            setUpdatingReqId(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-brand-offwhite flex items-center justify-center animate-pulse" />;
    }

    // Top 5 most recent requests
    const recentRequests = [...visitRequests].sort((a, b) => new Date(b.created_at || b.requested_date) - new Date(a.created_at || a.requested_date)).slice(0, 5);

    return (
        <div className="min-h-screen bg-brand-offwhite flex flex-col">
            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-24">
                {/* Header Section */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Badge variant="accent" className="mb-4 bg-brand-accent/10 text-brand-blue-primary font-black uppercase tracking-widest border-none">Lister Command Center</Badge>
                        <h1 className="text-4xl md:text-5xl font-black text-brand-gray-dark tracking-tighter leading-none mb-3">
                            Welcome Back, {user?.first_name || 'Partner'}
                        </h1>
                        <p className="text-brand-gray-medium font-medium max-w-2xl">
                            Monitor your premium listings, track incoming leads, and optimize your portfolio performance.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="px-6 border-brand-gray-light bg-white" onClick={() => navigate('/profile')}>
                            Account Settings
                        </Button>
                        <Button variant="outline" className="px-6 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" onClick={() => navigate('/dashboard/earnings')}>
                            View Earnings
                        </Button>
                        <Button variant="primary" className="px-8 shadow-xl shadow-brand-blue-primary/20" onClick={() => navigate('/my-listings/create')}>
                            + List New Property
                        </Button>
                    </div>
                </header>

                <div className="space-y-12">
                    {/* Analytics Row */}
                    <section>
                        <h2 className="text-xl font-black mb-6 text-brand-gray-dark flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-brand-blue-primary rounded-full"></span>
                            Performance Overview
                        </h2>
                        <ListerStats stats={stats} />
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left/Main Column: Portfolio */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <LeadsBoard leads={visitRequests} onUpdate={handleUpdateVisit} />
                            </section>
                            <section>
                                <ListingsTable properties={properties} />
                            </section>
                        </div>

                        {/* Right Column: Recent Enquiries */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white border-2 border-brand-gray-light rounded-[40px] p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black tracking-tighter text-brand-gray-dark">Recent Enquiries</h3>
                                    <Badge variant="neutral" className="bg-brand-offwhite text-brand-gray-dark">TOP 5</Badge>
                                </div>
                                <div className="space-y-4">
                                    {recentRequests.length > 0 ? (
                                        recentRequests.map((req, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-brand-offwhite/50 border border-brand-gray-light/50 hover:bg-brand-offwhite transition-colors group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-sm font-black text-brand-gray-dark group-hover:text-brand-blue-primary transition-colors">
                                                            {req.property_title || req.property?.title || 'Property Inquiry'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-brand-gray-medium uppercase tracking-widest mt-1">
                                                            {req.tenant_name || req.user?.first_name || 'Prospective Tenant'}
                                                        </p>
                                                    </div>
                                                    <Badge variant={req.status === 'Pending' ? 'accent' : 'neutral'} className="text-[8px] py-1 px-2 border-none bg-white shadow-sm">
                                                        {req.status || 'Pending'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 text-xs text-brand-gray-medium font-medium">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {req.requested_date ? new Date(req.requested_date).toLocaleDateString() : 'Flexible'}
                                                </div>
                                                {req.status === 'pending' && (
                                                    <div className="flex gap-2 mt-4 pt-3 border-t border-brand-gray-light/30">
                                                        <Button
                                                            variant="primary"
                                                            className="flex-1 text-[10px] py-1.5 px-0 h-auto opacity-90 hover:opacity-100"
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateVisit(req.id, req.property?.id || req.property_id, 'confirmed'); }}
                                                            disabled={updatingReqId === req.id}
                                                        >
                                                            {updatingReqId === req.id ? '...' : 'Accept'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 text-[10px] py-1.5 px-0 h-auto border-brand-gray-light hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateVisit(req.id, req.property?.id || req.property_id, 'cancelled'); }}
                                                            disabled={updatingReqId === req.id}
                                                        >
                                                            {updatingReqId === req.id ? '...' : 'Decline'}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-[10px] font-black text-brand-gray-medium uppercase tracking-[0.2em]">No recent enquiries found</p>
                                        </div>
                                    )}
                                </div>
                                {visitRequests.length > 5 && (
                                    <Button variant="outline" fullWidth className="mt-6 border-brand-gray-light text-xs font-black">
                                        View All Enquiries
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ListerDashboard;
