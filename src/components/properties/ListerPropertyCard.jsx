import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button';
import { propertyService } from '../../services/propertyService';

// ── Status cycling ──────────────────────────────────────────────────────────
const STATUS_CYCLE = ['active', 'pending', 'sold'];

const STATUS_STYLES = {
    active: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    sold: 'bg-gray-100 text-gray-500 border-gray-200',
    available: 'bg-green-100 text-green-700 border-green-200',
    booked: 'bg-blue-100 text-brand-blue-primary border-blue-200',
    unavailable: 'bg-red-100 text-red-700 border-red-200',
};

// ── Visit Request Row ───────────────────────────────────────────────────────
const VisitRequestRow = ({ request, propertyId, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState(request.status);

    const handleAction = async (newStatus) => {
        setLoading(true);
        // Optimistic update
        setLocalStatus(newStatus);
        try {
            await propertyService.updateVisitRequest(propertyId, request.id, newStatus);
            onUpdate(request.id, newStatus);
        } catch (err) {
            console.error('Failed to update visit request:', err);
            setLocalStatus(request.status); // revert on error
        } finally {
            setLoading(false);
        }
    };

    const isPending = localStatus === 'pending' || localStatus === 'requested';

    return (
        <div className="flex items-center justify-between gap-3 py-2 border-b border-brand-gray-light/60 last:border-0">
            <div className="min-w-0">
                <p className="text-xs font-semibold text-brand-gray-dark truncate">
                    {request.requester_name || request.user?.first_name || 'Visitor'}
                </p>
                <p className="text-xs text-brand-gray-medium">
                    {request.requested_date
                        ? new Date(request.requested_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'Date TBD'}
                </p>
            </div>

            {isPending ? (
                <div className="flex gap-1.5 shrink-0">
                    <button
                        onClick={() => handleAction('accepted')}
                        disabled={loading}
                        className="px-2 py-1 text-xs font-bold rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                        Accept
                    </button>
                    <button
                        onClick={() => handleAction('declined')}
                        disabled={loading}
                        className="px-2 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                        Decline
                    </button>
                </div>
            ) : (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border capitalize ${STATUS_STYLES[localStatus] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {localStatus}
                </span>
            )}
        </div>
    );
};

// ── Main Card ───────────────────────────────────────────────────────────────
const ListerPropertyCard = ({ property, onDelete }) => {
    const [showLeads, setShowLeads] = useState(false);
    const [visitRequests, setVisitRequests] = useState([]);
    const [leadsLoading, setLeadsLoading] = useState(false);
    const [leadsError, setLeadsError] = useState(null);

    // Status toggle state
    const [listingStatus, setListingStatus] = useState(
        property.availability_status || 'active'
    );
    const [statusUpdating, setStatusUpdating] = useState(false);

    // Fetch visit requests when leads panel opens
    useEffect(() => {
        if (!showLeads) return;
        const fetchRequests = async () => {
            setLeadsLoading(true);
            setLeadsError(null);
            try {
                const data = await propertyService.getVisitRequests(property.id);
                setVisitRequests(Array.isArray(data) ? data : data.results || []);
            } catch (err) {
                // Backend endpoint may not exist yet — fail gracefully
                setLeadsError('Could not load visit requests.');
                console.error('Visit requests fetch error:', err);
            } finally {
                setLeadsLoading(false);
            }
        };
        fetchRequests();
    }, [showLeads, property.id]);

    const handleVisitUpdate = (requestId, newStatus) => {
        setVisitRequests(prev =>
            prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r)
        );
    };

    const cycleStatus = async () => {
        const current = STATUS_CYCLE.indexOf(listingStatus);
        const next = STATUS_CYCLE[(current + 1) % STATUS_CYCLE.length];
        setStatusUpdating(true);
        setListingStatus(next); // optimistic
        try {
            await propertyService.updateProperty(property.id, { availability_status: next });
        } catch (err) {
            console.error('Failed to update status:', err);
            setListingStatus(listingStatus); // revert
        } finally {
            setStatusUpdating(false);
        }
    };

    const primaryImage = (() => {
        if (property.images && property.images.length > 0) {
            const primary = property.images.find(img => img.is_primary);
            return primary?.image_url || property.images[0]?.image_url;
        }
        return null;
    })();

    const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0UyRThGMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk0QTNCNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zNWVtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

    const pendingCount = visitRequests.filter(
        r => r.status === 'pending' || r.status === 'requested'
    ).length;

    return (
        <div className="bg-white border-2 border-brand-gray-light rounded-2xl shadow-card hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden bg-brand-gray-light">
                <img
                    src={primaryImage || PLACEHOLDER}
                    alt={property.title}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                    className="w-full h-full object-cover"
                />

                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    {property.is_active ? (
                        <span className="bg-brand-blue-primary text-white px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Active</span>
                    ) : (
                        <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Inactive</span>
                    )}
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm border border-brand-gray-light">
                    <span className="text-brand-gray-dark font-bold">${property.rent_price}</span>
                    <span className="text-brand-gray-medium text-xs ml-1">/ month</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col gap-3">
                {/* Title + Type */}
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-base font-bold text-brand-gray-dark line-clamp-1 flex-1" title={property.title}>
                        {property.title}
                    </h3>
                    <span className="text-brand-gray-medium text-xs font-medium bg-brand-gray-light px-2 py-0.5 rounded uppercase min-w-max shrink-0">
                        {property.property_type?.replace('_', ' ')}
                    </span>
                </div>

                {/* Location */}
                <p className="text-brand-gray-medium text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.city ? `${property.city}${property.state ? `, ${property.state}` : ''}` : 'Location Not Set'}
                </p>

                {/* Status Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-gray-medium font-medium">Status:</span>
                    <button
                        onClick={cycleStatus}
                        disabled={statusUpdating}
                        title="Click to cycle status"
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wide transition-all disabled:opacity-60 cursor-pointer ${STATUS_STYLES[listingStatus] || 'bg-gray-100 text-gray-500 border-gray-200'}`}
                    >
                        {listingStatus}
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-brand-gray-light flex items-center gap-2">
                    <Link to={`/my-listings/edit/${property.id}`} className="flex-1">
                        <Button variant="outline" fullWidth className="py-2 text-sm">Edit</Button>
                    </Link>
                    <button
                        onClick={() => onDelete(property.id)}
                        className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
                        title="Delete Property"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                {/* ── Lead Management Panel ───────────────────────────────── */}
                <div className="border-t border-brand-gray-light pt-3">
                    <button
                        onClick={() => setShowLeads(prev => !prev)}
                        className="w-full flex items-center justify-between text-xs font-bold text-brand-gray-dark hover:text-brand-blue-primary transition-colors"
                    >
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Lead Management
                            {pendingCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-brand-blue-primary text-white rounded-full text-xs">
                                    {pendingCount}
                                </span>
                            )}
                        </span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${showLeads ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showLeads && (
                        <div className="mt-3">
                            {leadsLoading ? (
                                <div className="space-y-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-8 bg-brand-gray-light rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : leadsError ? (
                                <p className="text-xs text-red-500 py-1">{leadsError}</p>
                            ) : visitRequests.length === 0 ? (
                                <p className="text-xs text-brand-gray-medium py-2 text-center">
                                    No visit requests yet.
                                </p>
                            ) : (
                                <div>
                                    {visitRequests.map(req => (
                                        <VisitRequestRow
                                            key={req.id}
                                            request={req}
                                            propertyId={property.id}
                                            onUpdate={handleVisitUpdate}
                                        />
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
