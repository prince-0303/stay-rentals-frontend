import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23F3F4F6"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="bold" font-size="16" fill="%239CA3AF" text-anchor="middle" dy=".35em">Ez-Stay Premium</text></svg>';

function getPrimaryImage(property) {
    if (property.primary_image) return property.primary_image;
    if (Array.isArray(property.images) && property.images.length > 0) {
        const primary = property.images.find(img => img.is_primary);
        return primary?.image_url || property.images[0]?.image_url || null;
    }
    return property.image_url || property.image || null;
}

const PropertyCard = ({ property, isWishlisted, onToggleWishlist }) => {
    const { isPaid, loading } = usePaymentStatus(property.id);
    const [liked, setLiked] = useState(!!isWishlisted);
    const [imgError, setImgError] = useState(false);
    const resolvedSrc = useMemo(() => getPrimaryImage(property), [property]);
    const displaySrc = imgError || !resolvedSrc ? PLACEHOLDER : resolvedSrc;

    useEffect(() => {
        setLiked(!!isWishlisted);
    }, [isWishlisted]);

    const handleHeartClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLiked(prev => !prev);
        if (onToggleWishlist) onToggleWishlist(property.id, liked);
    };

    const isComparing = (() => {
        try {
            const list = JSON.parse(localStorage.getItem('compare_list') || '[]');
            return list.some(p => String(p.id) === String(property.id));
        } catch { return false; }
    })();

    const [comparing, setComparing] = useState(isComparing);

    const handleCompareClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const list = JSON.parse(localStorage.getItem('compare_list') || '[]');
        const exists = list.some(p => String(p.id) === String(property.id));

        let newList;
        if (exists) {
            newList = list.filter(p => String(p.id) !== String(property.id));
            setComparing(false);
        } else {
            if (list.length >= 3) {
                alert('Max 3 properties for comparison.');
                return;
            }
            newList = [...list, { id: property.id, title: property.title, price: property.rent_price || property.price, images: property.images, city: property.city }];
            setComparing(true);
        }
        localStorage.setItem('compare_list', JSON.stringify(newList));
        window.dispatchEvent(new Event('compare_updated'));
    };

    if (loading) {
        return (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-white rounded-premium border-2 border-brand-gray-light">
                <div className="w-8 h-8 border-4 border-brand-blue-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <Link
            to={`/listings/${property.id}`}
            className={`group relative rounded-premium overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 flex flex-col h-full border-2 border-brand-gray-light ${isPaid ? 'opacity-75 pointer-events-none' : ''}`}
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden bg-brand-gray-light">
                <img
                    src={displaySrc}
                    alt={property.title || 'Property'}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isPaid && (
                        <div className="absolute top-0 -right-4 translate-x-1/2 -translate-y-1/2 z-20"> {/* This positioning is relative to parent, let's stick to simple absolute top-right */}
                        </div>
                    )}
                    {property.is_featured && (
                        <Badge variant="accent" className="shadow-lg backdrop-blur-md bg-brand-accent/90 text-brand-blue-primary font-black uppercase tracking-tighter py-1 px-3">
                            Featured
                        </Badge>
                    )}
                    {property.property_type && (
                        <Badge variant="neutral" className="shadow-lg backdrop-blur-md bg-white/80 text-brand-blue-primary font-bold py-1 px-3">
                            {property.property_type}
                        </Badge>
                    )}
                </div>

                {/* Booked Badge */}
                {isPaid && (
                    <div className="absolute top-4 right-4 z-20 bg-red-600 text-white rounded-full text-xs px-2 py-1 font-bold shadow-lg flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Booked
                    </div>
                )}

                {/* Wishlist Button - Only show if not paid to avoid clutter, since pointer-events-none is on wrapper anyway */}
                {!isPaid && (
                    <button
                        onClick={handleHeartClick}
                        className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md border border-white/30 shadow-xl transition-all duration-300 transform hover:scale-110 z-10 
                            ${liked ? 'bg-red-500 border-red-400' : 'bg-white/80 hover:bg-white text-brand-gray-dark'}`}
                    >
                        <svg
                            className={`w-5 h-5 transition-colors duration-300 ${liked ? 'text-white fill-current' : 'text-brand-gray-medium group-hover:text-red-400'}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                )}

                {/* Compare Button */}
                {!isPaid && (
                    <button
                        onClick={handleCompareClick}
                        title={comparing ? "Remove from comparison" : "Add to compare"}
                        className={`absolute top-16 right-4 p-2.5 rounded-full backdrop-blur-md border border-white/30 shadow-xl transition-all duration-300 transform hover:scale-110 z-10 
                            ${comparing ? 'bg-brand-blue-primary border-brand-blue-primary' : 'bg-white/80 hover:bg-white text-brand-gray-dark'}`}
                    >
                        <svg
                            className={`w-5 h-5 transition-colors duration-300 ${comparing ? 'text-white' : 'text-brand-gray-medium group-hover:text-brand-blue-primary'}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 3v4m0 0v4m0-4h4m-4 0h-4M8 21v-4m0 0v-4m0 4H4m4 0h4" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                <div className="mb-5">
                    <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-extrabold text-brand-gray-dark leading-snug group-hover:text-brand-blue-primary transition-colors line-clamp-2">
                                {property.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-2 opacity-70">
                                <svg className="w-3 h-3 text-brand-blue-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-[10px] font-bold text-brand-gray-medium uppercase tracking-widest truncate">
                                    {property.city || property.location || 'Premium Location'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 text-right">
                            <span className="text-2xl font-black text-brand-blue-primary tracking-tighter leading-none">₹{property.rent_price || property.price || '—'}</span>
                            <span className="text-[9px] font-bold text-brand-gray-medium uppercase tracking-widest mt-1">/ month</span>
                        </div>
                    </div>
                </div>

                <p className="text-sm font-medium text-brand-gray-medium line-clamp-2 mb-6 leading-relaxed">
                    {property.description || 'A stunning premium property featuring modern architecture and world-class amenities in a prime location.'}
                </p>

                {/* Amenities Bar */}
                <div className="mt-auto pt-4 border-t border-brand-gray-light/50 flex items-center justify-between text-brand-gray-dark">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black">3</span>
                            <span className="text-[10px] font-semibold text-brand-gray-medium uppercase">Beds</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black">2</span>
                            <span className="text-[10px] font-semibold text-brand-gray-medium uppercase">Baths</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black">1200</span>
                            <span className="text-[10px] font-semibold text-brand-gray-medium uppercase">Sqft</span>
                        </div>
                    </div>
                    {property.rating && (
                        <div className="flex items-center gap-1 bg-brand-accent/10 px-2 py-0.5 rounded-full">
                            <svg className="w-3 h-3 text-brand-accent fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <span className="text-[10px] font-black text-brand-blue-primary">{property.rating}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default PropertyCard;
