import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { propertyService } from '../../services/propertyService';

const STATUS_CYCLE = ['active', 'pending', 'sold'];

const VisitRequestRow = ({ request, propertyId, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState(request.status);

    const handleAction = async (newStatus) => {
        setLoading(true);
        setLocalStatus(newStatus);
        try {
            await propertyService.updateVisitRequest(propertyId, request.id, newStatus);
            onUpdate(request.id, newStatus);
        } catch (err) {
            setLocalStatus(request.status);
        } finally {
            setLoading(false);
        }
    };

    const isPending = localStatus === 'pending' || localStatus === 'requested';

    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-brand-gray-light last:border-0 group/row">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-offwhite flex items-center justify-center font-black text-[10px] text-brand-blue-primary">
                    {(request.requester_name || request.user?.first_name || 'V')[0]}
                </div>
                <div>
                    <p className="text-xs font-black text-brand-gray-dark truncate max-w-[100px]">
                        {request.requester_name || request.user?.first_name || 'Visitor'}
                    </p>
                    <p className="text-[10px] font-bold text-brand-gray-medium uppercase tracking-tighter">
                        {request.requested_date ? new Date(request.requested_date).toLocaleDateString() : 'Date TBD'}
                    </p>
                </div>
            </div>

            {isPending ? (
                <div className="flex gap-2">
                    <button onClick={() => handleAction('accepted')} disabled={loading} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button onClick={() => handleAction('declined')} disabled={loading} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ) : (
                <Badge variant={localStatus === 'accepted' ? 'primary' : 'neutral'} className="text-[9px] font-black uppercase py-1 px-2">
                    {localStatus}
                </Badge>
            )}
        </div>
    );
};

const ListerPropertyCard = ({ property, onDelete }) => {
    const [showLeads, setShowLeads] = useState(false);
    const [visitRequests, setVisitRequests] = useState([]);
    const [leadsLoading, setLeadsLoading] = useState(false);

    const [listingStatus, setListingStatus] = useState(property.availability_status || 'active');
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        if (!showLeads) return;
        const fetchRequests = async () => {
            setLeadsLoading(true);
            try {
                const data = await propertyService.getVisitRequests(property.id);
                setVisitRequests(Array.isArray(data) ? data : data.results || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLeadsLoading(false);
            }
        };
        fetchRequests();
    }, [showLeads, property.id]);

    const handleVisitUpdate = (requestId, newStatus) => {
        setVisitRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    };

    const cycleStatus = async () => {
        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(listingStatus) + 1) % STATUS_CYCLE.length];
        setStatusUpdating(true);
        setListingStatus(next);
        try {
            await propertyService.updateProperty(property.id, { availability_status: next });
        } catch (err) {
            setListingStatus(listingStatus);
        } finally {
            setStatusUpdating(false);
        }
    };

    const getPrimaryImage = (prop) => {
        if (prop.primary_image) return prop.primary_image;
        if (Array.isArray(prop.images) && prop.images.length > 0) {
            const primary = prop.images.find(img => img.is_primary);
            return primary?.image_url || prop.images[0]?.image_url || null;
        }
        return prop.image_url || prop.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800';
    };

    const primaryImage = getPrimaryImage(property);

    const pendingCount = visitRequests.filter(r => r.status === 'pending' || r.status === 'requested').length;

    return (
        <div className="bg-white border border-brand-gray-light rounded-[40px] overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
            <div className="relative h-64 overflow-hidden">
                <img src={primaryImage} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-5 right-5 flex flex-col gap-2">
                    <Badge variant={property.availability_status === 'booked' ? 'success' : property.is_active ? 'primary' : 'neutral'} className="bg-white/90 backdrop-blur-md px-3 py-1 font-black tracking-widest text-[10px]">
                        {property.availability_status === 'booked' ? 'BOOKED' : property.is_active ? 'LIVE' : 'ARCHIVED'}
                    </Badge>
                </div>
                <div className="absolute bottom-5 left-5 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/20">
                    <p className="text-xl font-black">₹{property.rent_price.toLocaleString()}<span className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/70">/mo</span></p>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col gap-6">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-black text-brand-gray-dark tracking-tighter line-clamp-1">{property.title}</h3>
                        <Badge variant="accent" className="bg-brand-accent/20 text-brand-blue-primary border-none text-[9px] font-black">{property.property_type}</Badge>
                    </div>
                    <p className="text-xs font-bold text-brand-gray-medium uppercase tracking-tight flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-brand-blue-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {property.city}, {property.state}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-offwhite rounded-2xl border border-brand-gray-light/30">
                        <span className="text-[9px] font-black text-brand-gray-light uppercase tracking-widest leading-none">Status</span>
                        <button
                            onClick={listingStatus === 'booked' ? undefined : cycleStatus}
                            disabled={statusUpdating || listingStatus === 'booked'}
                            className={`text-[10px] font-black uppercase transition-all ${listingStatus === 'booked' ? 'text-blue-600 cursor-not-allowed' :
                                listingStatus === 'active' ? 'text-green-600' :
                                    listingStatus === 'pending' ? 'text-yellow-600' :
                                        'text-brand-gray-medium'
                                }`}>
                            {listingStatus}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link to={`/my-listings/edit/${property.id}`} className="flex-1">
                        <Button variant="outline" fullWidth className="py-3 text-[10px] font-black uppercase tracking-widest hover:bg-brand-offwhite border-brand-gray-light">Modify</Button>
                    </Link>
                    <button onClick={() => onDelete(property.id)} className="p-3 border border-red-100 text-red-500 rounded-2xl hover:bg-red-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>

                <div className="pt-6 border-t border-brand-gray-light">
                    <button onClick={() => setShowLeads(!showLeads)} className="w-full flex items-center justify-between group/lead">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-brand-offwhite flex items-center justify-center text-brand-gray-medium group-hover/lead:bg-brand-blue-primary group-hover/lead:text-white transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-gray-dark group-hover/lead:text-brand-blue-primary transition-colors">Engagement</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {pendingCount > 0 && <Badge variant="primary" className="text-[8px] py-1 px-1.5 min-w-[20px] rounded-lg">+{pendingCount}</Badge>}
                            <svg className={`w-4 h-4 text-brand-gray-light transition-transform duration-300 ${showLeads ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </button>

                    {showLeads && (
                        <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                            {leadsLoading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => <div key={i} className="h-12 bg-brand-offwhite rounded-2xl animate-pulse" />)}
                                </div>
                            ) : visitRequests.length === 0 ? (
                                <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-widest text-center py-4 bg-brand-offwhite/50 rounded-2xl">No inquiries yet.</p>
                            ) : (
                                <div className="max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                    {visitRequests.map(req => (
                                        <VisitRequestRow key={req.id} request={req} propertyId={property.id} onUpdate={handleVisitUpdate} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListerPropertyCard;
