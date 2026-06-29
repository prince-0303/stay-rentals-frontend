import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import PropertyCard from '../../components/property/PropertyCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Footer from '../../components/common/Footer';
import { getProfile, updateAvatar, getKYCStatus } from '../../services/authService';
import { getUserProfile, updateUserProfile } from '../../services/profileService';
import { propertyService } from '../../services/propertyService';
import ListerStats from '../../components/lister/StatsCard';
import ListingsTable from '../../components/lister/ListingsTable';
import LeadsBoard from '../../components/lister/LeadGraph';
import { RecentlyViewed, ScheduledVisits, AccountActions, NotificationSettings } from '../../components/dashboard/UserComponents';
import MFASettings from '../../components/dashboard/MFASettings';
import UserPreferences from '../../components/dashboard/UserPreferences';
import api from '../../services/api';


const Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [extendedProfile, setExtendedProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const [kycStatus, setKycStatus] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [visits, setVisits] = useState([]);
    const [payments, setPayments] = useState([]);
    const [fetchingData, setFetchingData] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const profile = await getProfile();
                setUser(profile);
                setEditData(profile);

                try {
                    const profileData = await getUserProfile();
                    setExtendedProfile(profileData);
                    setEditData(prev => ({ ...prev, ...profileData }));
                } catch (err) { }

                if (profile.role === 'lister') {
                    try {
                        const kycData = await getKYCStatus();
                        setKycStatus(kycData);
                    } catch (err) { }
                }

                if (!searchParams.get('tab')) {
                    setSearchParams({ tab: 'overview' });
                }

            } catch (error) {
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const activeTab = searchParams.get('tab');

        const fetchTabData = async () => {
            setFetchingData(true);
            try {
                if (activeTab === 'wishlist') {
                    const list = await propertyService.getSavedProperties();
                    setWishlist(list.map(item => item.property || item));
                } else if (activeTab === 'visits') {
                    const myVisits = await propertyService.getMyVisits();
                    setVisits(myVisits);
                } else if (activeTab === 'payments') {
                    const res = await api.get('/payments/my-payments/');
                    setPayments(res.data.payments || []);
                }
            } catch (err) { } finally {
                setFetchingData(false);
            }
        };

        if (activeTab === 'wishlist' || activeTab === 'visits' || activeTab === 'payments') {
            fetchTabData();
        }
    }, [searchParams, user?.id]);

    const activeTab = searchParams.get('tab');

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
        setIsEditing(false);
    };

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const saveProfile = async () => {
        try {
            setLoading(true);
            const updated = await updateUserProfile({
                first_name: editData.first_name || '',
                last_name: editData.last_name || '',
                phone_number: editData.phone_number || '',
                date_of_birth: editData.date_of_birth || null,
                gender: editData.gender || null,
                address_line: editData.address_line || '',
                city: editData.city || '',
                state: editData.state || '',
                pincode: editData.pincode || '',
            });
            setUser(prev => ({ ...prev, first_name: editData.first_name || prev.first_name, last_name: editData.last_name || prev.last_name, phone_number: editData.phone_number || prev.phone_number }));
            setExtendedProfile(updated);
            setIsEditing(false);
        } catch (err) {
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarLoading(true);
        try {
            const response = await updateAvatar(file);
            setUser(prev => ({ ...prev, avatar: response.avatar || prev.avatar }));
            setAvatarPreview(null);
        } catch (error) {
            setAvatarPreview(null);
        } finally {
            setAvatarLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand-blue-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (user?.role === 'lister' && kycStatus && kycStatus.status !== 'approved') {
        // KYC pending/rejected logic (already handled in original, just styling here)
        if (kycStatus.status === 'pending') {
            return (
                <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center p-6 pb-24">
                    <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl max-w-[448px] w-full text-center space-y-8 border border-brand-gray-light">
                        <div className="w-24 h-24 bg-brand-offwhite rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-brand-blue-primary/10 animate-pulse" />
                            <svg className="w-8 h-8 text-brand-blue-primary relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-3xl font-black">Hold Tight</h2>
                        <p className="text-brand-gray-medium font-bold leading-relaxed">Your Ez-Stay lister verification is in progress. Our curators typically approve accurate profiles within 24 hours.</p>
                        <Button variant="outline" className="w-full py-4 rounded-3xl" onClick={() => window.location.reload()}>Sync Status</Button>
                    </div>
                </div>
            );
        }
    }

    const renderOverview = () => {
        const avatarSrc = avatarPreview || user.avatar;

        return (
            <div className="animate-fadeIn">
                <div className="bg-white border border-brand-gray-light p-4 sm:p-6 rounded-3xl shadow-sm relative">
                    {/* Top Actions (Responsive, no absolute overlap) */}
                    <div className="w-full flex justify-end mb-2">
                        {!isEditing ? (
                            <button className="flex items-center gap-1.5 text-brand-blue-primary hover:text-brand-blue-dark transition-colors text-xs font-black uppercase tracking-wider bg-brand-blue-primary/10 hover:bg-brand-blue-primary/20 px-3 py-1.5 rounded-full" onClick={() => setIsEditing(true)}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button className="text-xs font-bold uppercase tracking-wider text-brand-gray-medium hover:text-brand-gray-dark px-2" onClick={() => setIsEditing(false)}>Cancel</button>
                                <button className="flex items-center gap-1.5 text-white bg-brand-blue-primary hover:bg-brand-blue-dark transition-colors px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md" onClick={saveProfile}>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Basic Info (Always visible) */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative group mb-4 mt-2">
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden relative group bg-brand-offwhite">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-brand-blue-primary flex items-center justify-center text-3xl font-black text-white">
                                        {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                {isEditing && (
                                    <label className="absolute inset-0 bg-brand-blue-primary/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                        <svg className="w-5 h-5 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarLoading} />
                                    </label>
                                )}
                            </div>
                            {avatarLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full"><div className="w-6 h-6 border-4 border-brand-blue-primary border-t-transparent rounded-full animate-spin" /></div>}
                        </div>
                        <Badge variant="neutral" className="bg-brand-gray-light/40 text-brand-gray-dark font-black tracking-widest mb-2 uppercase text-[10px]">{user.role} Member</Badge>
                        <h2 className="text-2xl font-black tracking-tight">{user.first_name} {user.last_name}</h2>
                        <p className="text-sm font-bold text-brand-blue-primary mt-1">{user.email}</p>
                        {(user.phone_number || extendedProfile?.phone_number) && (
                            <p className="text-sm font-medium text-brand-gray-medium mt-0.5">{user.phone_number || extendedProfile?.phone_number}</p>
                        )}
                    </div>

                    {/* Extended Details (Only visible in Edit Mode) */}
                    {isEditing && (
                        <div className="mt-10 pt-6 border-t border-brand-gray-light">
                            <h3 className="text-sm font-black uppercase tracking-wider text-brand-gray-dark mb-4">Edit Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'First Name', value: user.first_name, name: 'first_name' },
                                    { label: 'Last Name', value: user.last_name, name: 'last_name' },
                                    { label: 'Phone', value: user.phone_number || '', name: 'phone_number' },
                                    { label: 'Birth Date', value: extendedProfile?.date_of_birth || '', name: 'date_of_birth', type: 'date' },
                                    { label: 'City', value: extendedProfile?.city || '', name: 'city' },
                                    { label: 'State', value: extendedProfile?.state || '', name: 'state' }
                                ].map((field, idx) => (
                                    <div key={idx} className="bg-brand-offwhite p-4 rounded-2xl">
                                        <label className="text-[9px] font-black text-brand-gray-medium uppercase tracking-[0.2em] block mb-1.5">{field.label}</label>
                                        <input
                                            type={field.type || 'text'}
                                            name={field.name}
                                            value={editData[field.name] || ''}
                                            onChange={handleEditChange}
                                            className="w-full bg-white border border-brand-gray-light rounded-xl px-3 py-2 text-sm font-bold text-brand-gray-dark outline-none focus:ring-2 focus:ring-brand-blue-primary/20 transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <ListerStats />;
            case 'listings': return <ListingsTable />;
            case 'leads': return <LeadsBoard />;
            case 'wishlist':
                if (fetchingData) return <div className="text-sm font-black text-brand-gray-medium animate-pulse">Syncing wishlist...</div>;
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {wishlist.length > 0 ? wishlist.map(p => <PropertyCard key={p.id} property={p} isWishlisted={true} />) : <div className="col-span-full text-center py-20 bg-brand-offwhite rounded-[40px] font-black text-brand-gray-light uppercase tracking-widest">No listings saved.</div>}
                    </div>
                );
            case 'recently-viewed': return <RecentlyViewed />;
            case 'visits': return <ScheduledVisits visits={visits} loading={fetchingData} />;
            case 'payments':
                if (fetchingData) return <div className="text-sm font-black text-brand-gray-medium animate-pulse">Syncing payments...</div>;
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h3 className="text-2xl font-black mb-2">My Payments</h3>
                                <p className="text-sm text-brand-gray-medium font-medium">Track your advance payments and booking receipts</p>
                            </div>
                            <Badge variant="neutral" className="bg-emerald-50 text-emerald-700 font-black px-4">{payments.length} Payments</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {payments.length > 0 ? payments.map((p, idx) => (
                                <div key={idx} className="bg-brand-offwhite border border-brand-gray-light/50 p-6 md:p-8 rounded-[32px] hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex gap-6">
                                            <div className="w-16 h-16 bg-white rounded-2xl border border-brand-gray-light flex items-center justify-center shrink-0">
                                                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-brand-gray-dark mb-1 group-hover:text-brand-blue-primary transition-colors">{p.property_title}</h4>
                                                <div className="flex items-center gap-3 text-brand-gray-medium text-xs font-bold uppercase tracking-wider">
                                                    <span>{p.city || p.property_city || 'Property Location'}</span>
                                                    <span className="w-1 h-1 bg-brand-gray-light rounded-full"></span>
                                                    <span>Paid on {p.created_at || 'Recent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-brand-gray-light/30 pt-4 md:pt-0 md:pl-8">
                                            <p className="text-2xl font-black text-emerald-600">₹{new Intl.NumberFormat('en-IN').format(p.amount)}</p>
                                            <div className="flex flex-col items-end">
                                                <Badge variant="neutral" className="text-[9px] bg-white border-brand-gray-light text-brand-gray-medium font-bold px-2 py-0.5">ID: {p.razorpay_payment_id}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-24 bg-brand-offwhite rounded-[40px] border-2 border-dashed border-brand-gray-light">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gray-light group-hover:scale-110 transition-transform">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 100 0z" /></svg>
                                    </div>
                                    <p className="font-black text-brand-gray-medium uppercase tracking-[0.2em] mb-2">No transaction records</p>
                                    <p className="text-xs text-brand-gray-light font-bold">When you pay advance for a property, the receipt will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'overview': return renderOverview();
            case 'preferences': return <UserPreferences />;
            case 'security': return <MFASettings />;
            case 'account': return (
                <div className="space-y-12">
                    <NotificationSettings />
                    <AccountActions />
                </div>
            );
            default: return renderOverview();
        }
    };

    return (
        <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">
            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <Sidebar role={user.role} activeTab={activeTab} onTabChange={handleTabChange} />
                    <div className="lg:col-span-9 relative w-full">
                        <div className="relative z-10 w-full">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
