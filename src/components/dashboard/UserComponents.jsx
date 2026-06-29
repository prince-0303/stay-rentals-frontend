import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { deactivateAccount, deleteAccount } from '../../services/authService';
import { propertyService } from '../../services/propertyService';
import PropertyCard from '../property/PropertyCard';
import { requestNotificationPermission } from '../../hooks/usePushNotifications';

export const RecentlyViewed = () => {
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        setRecent(JSON.parse(localStorage.getItem('recently_viewed') || '[]'));
    }, []);

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-black">Browse History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recent.length === 0 ? (
                    <div className="bg-brand-offwhite border-2 border-dashed border-brand-gray-light rounded-[32px] p-12 flex flex-col items-center justify-center text-center opacity-60 col-span-full">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-gray-light mb-4 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="font-black text-[10px] uppercase tracking-widest">History is Empty</p>
                        <p className="text-xs font-bold text-brand-gray-medium mt-2">Resume your search to see recently viewed properties here.</p>
                    </div>
                ) : (
                    recent.map(p => <PropertyCard key={p.id} property={p} />)
                )}
            </div>
        </div>
    );
};

export const ScheduledVisits = ({ visits = [], loading }) => {
    const handleCancel = async (visitId) => {
        if (!window.confirm("Are you sure you want to cancel this visit request?")) return;
        try {
            const res = await propertyService.updateVisitRequest(null, visitId, 'cancelled');
            if (res.warning) {
                alert(res.warning);
            }
            window.location.reload();
        } catch (error) {
            alert("Failed to cancel visit.");
        }
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-brand-offwhite rounded-3xl animate-pulse" />)}
        </div>
    );

    if (visits.length === 0) {
        return (
            <div className="bg-brand-offwhite border-2 border-dashed border-brand-gray-light rounded-[32px] p-16 flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-gray-light mb-4 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="font-black text-[10px] uppercase tracking-widest">No Scheduled Visits</p>
                <p className="text-xs font-bold text-brand-gray-medium mt-2">Book a visit from the property details page to get started.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-black mb-8">Confirmed Engagements</h3>
            {visits.map(visit => {
                const propertyTitle = visit.property?.title || visit.property_title || 'Premium Property';
                let formattedDate = 'PENDING DATE';
                let formattedTime = '';
                if (visit.requested_date) {
                    try {
                        const d = new Date(visit.requested_date);
                        formattedDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
                        formattedTime = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                    } catch { }
                }

                return (
                    <div key={visit.id} className="bg-white border border-brand-gray-light p-8 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl transition-all duration-300 group">
                        <div className="flex gap-6 items-center">
                            <div className="w-2 h-14 bg-brand-blue-primary rounded-full" />
                            <div>
                                <h4 className="text-xl font-black text-brand-gray-dark group-hover:text-brand-blue-primary transition-colors">{propertyTitle}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge variant={visit.status === 'accepted' ? 'primary' : 'neutral'} className="font-black text-[10px] tracking-widest py-1 px-3">
                                        {visit.status.toUpperCase()}
                                    </Badge>
                                    <span className="text-xs font-bold text-brand-gray-medium">REQUEST REFERENCE: #{visit.id.toString().slice(-4)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-left md:text-right bg-brand-offwhite px-6 py-4 rounded-2xl border border-brand-gray-light min-w-[160px]">
                            <p className="text-sm font-black text-brand-blue-primary tracking-tighter">{formattedDate}</p>
                            {formattedTime && <p className="text-[10px] font-black text-brand-gray-medium mt-1">{formattedTime}</p>}
                            {visit.status !== 'cancelled' && visit.status !== 'completed' && (
                                <button onClick={() => handleCancel(visit.id)} className="mt-3 w-full bg-red-50 text-red-600 hover:bg-red-100 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-all">Cancel Visit</button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


export const AccountActions = () => {
    const navigate = useNavigate();

    const handleDeactivate = async () => {
        if (!window.confirm('Are you sure you want to deactivate your account? You can reactivate by contacting support.')) return;
        try {
            await deactivateAccount();
            localStorage.removeItem('user');
            navigate('/login');
        } catch {
            alert('Failed to deactivate account. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('This will permanently delete all your data. This cannot be undone. Are you sure?')) return;
        try {
            await deleteAccount();
            localStorage.removeItem('user');
            navigate('/login');
        } catch {
            alert('Failed to delete account. Please try again.');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-brand-gray-light p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                    <Badge variant="neutral" className="bg-brand-gray-light/30 text-brand-gray-dark font-black tracking-widest mb-3 uppercase text-[10px]">Control Center</Badge>
                    <h3 className="text-lg font-black text-brand-gray-dark mb-2">Deactivate Account</h3>
                    <p className="text-xs text-brand-gray-medium font-medium leading-relaxed mb-4">
                        Pause your activities on our platform. Your profile and active listings will be archived until you decide to return.
                    </p>
                </div>
                <Button variant="outline" className="border-brand-gray-light text-brand-gray-dark w-fit hover:bg-brand-offwhite" onClick={handleDeactivate}>
                    Temporarily Disable
                </Button>
            </div>

            <div className="bg-red-50 border border-red-100 p-4 sm:p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-110" />
                <div className="relative z-10">
                    <Badge variant="danger" className="bg-red-500 text-white font-black tracking-widest mb-3 uppercase border-none text-[10px]">Danger Zone</Badge>
                    <h3 className="text-lg font-black text-red-700 mb-2">Permanent Removal</h3>
                    <p className="text-xs text-red-900/60 font-medium leading-relaxed mb-4">
                        Once initialized, all your personal data, saved collections, and listing history will be permanently wiped from our secure servers.
                    </p>
                </div>
                <Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white w-fit shadow-xl shadow-red-200" onClick={handleDelete}>
                    Wipe All Data
                </Button>
            </div>
        </div>
    );
};

export const NotificationSettings = () => {
    const [status, setStatus] = useState(Notification.permission);

    const handleEnable = async () => {
        await requestNotificationPermission();
        setStatus(Notification.permission);
    };

    return (
        <div className="bg-white border border-brand-gray-light p-4 sm:p-5 rounded-2xl shadow-sm">
            <Badge variant="neutral" className="bg-brand-gray-light/30 text-brand-gray-dark font-black tracking-widest mb-3 uppercase text-[10px]">Notifications</Badge>
            <h3 className="text-lg font-black text-brand-gray-dark mb-2">Push Notifications</h3>
            <p className="text-xs text-brand-gray-medium font-medium leading-relaxed mb-4">
                Get notified about new messages, visit updates, and important account activity.
            </p>
            {status === 'granted' ? (
                <div className="flex items-center gap-3 text-green-600 font-black text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Notifications Enabled
                </div>
            ) : status === 'denied' ? (
                <p className="text-red-500 font-bold text-sm">Notifications blocked. Please enable them in your browser settings.</p>
            ) : (
                <Button variant="primary" onClick={handleEnable} className="w-fit">
                    Enable Notifications
                </Button>
            )}
        </div>
    );
};