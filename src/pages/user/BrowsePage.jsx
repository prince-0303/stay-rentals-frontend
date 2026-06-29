import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../../components/property/PropertyCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { propertyService } from '../../services/propertyService';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapRecenter = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 13, { duration: 1.5 });
        }
    }, [lat, lng, map]);
    return null;
};

const BrowsePage = () => {
    const [searchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Normal search & filters
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        property_type: '',
        min_price: '',
        max_price: '',
        preferred_tenant: '',
        pet_friendly: false
    });

    // AI Search
    const [isAiSearch, setIsAiSearch] = useState(false);
    const [aiAnswer, setAiAnswer] = useState(null);
    const [recommendedId, setRecommendedId] = useState(null);
    const [aiInput, setAiInput] = useState('');

    // Wishlist
    const [savedPropertyIds, setSavedPropertyIds] = useState(new Set());
    const [showMap, setShowMap] = useState(false);

    const fetchAll = async (currentFilters = filters, currentSearch = search) => {
        try {
            setLoading(true);
            setAiAnswer(null);
            setRecommendedId(null);

            const params = {};
            if (currentSearch) params.city = currentSearch;
            if (currentFilters.property_type) params.property_type = currentFilters.property_type.toLowerCase();
            if (currentFilters.min_price) params.min_price = currentFilters.min_price;
            if (currentFilters.max_price) params.max_price = currentFilters.max_price;
            if (currentFilters.preferred_tenant) params.preferred_tenants = currentFilters.preferred_tenant.toLowerCase();
            if (currentFilters.pet_friendly) params.pet_friendly = currentFilters.pet_friendly;

            const data = await propertyService.getAllProperties(params);
            setProperties(Array.isArray(data) ? data : data.results || []);
            setShowMap(prev => prev);
            setError(null);
        } catch (err) {
            setError('Unable to load listings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSaved = async () => {
        try {
            const data = await propertyService.getSavedProperties();
            const list = Array.isArray(data) ? data : data.results || [];
            setSavedPropertyIds(new Set(list.map(p => p.property?.id || p.id)));
        } catch (err) {
            console.error('Failed to fetch saved properties', err);
        }
    };

    // On mount: read URL params from hero search bar
    useEffect(() => {
        const isAi = searchParams.get('ai') === 'true';
        const query = searchParams.get('query') || '';
        const city = searchParams.get('city') || '';
        const type = searchParams.get('property_type') || '';
        const maxP = searchParams.get('max_price') || '';

        if (isAi && query) {
            // Trigger AI search immediately
            setIsAiSearch(true);
            setAiInput(query);
            setLoading(true);
            propertyService.aiSearch(query)
                .then(data => {
                    setAiAnswer(data.answer);
                    setRecommendedId(data.recommended_id);
                    setProperties(data.properties || []);
                    setError(null);
                })
                .catch(() => setError('AI Search failed.'))
                .finally(() => setLoading(false));
        } else {
            // Apply normal filters from URL params
            const newFilters = {
                property_type: type,
                min_price: '',
                max_price: maxP,
                preferred_tenant: '',
                pet_friendly: false,
            };
            if (city) setSearch(city);
            if (type) setFilters(prev => ({ ...prev, property_type: type }));
            if (maxP) setFilters(prev => ({ ...prev, max_price: maxP }));
            fetchAll(newFilters, city);
        }

        fetchSaved().catch(() => { });
    }, []);

    const performAiSearch = async () => {
        if (!aiInput.trim()) return;
        try {
            setLoading(true);
            const data = await propertyService.aiSearch(aiInput);
            setAiAnswer(data.answer);
            setRecommendedId(data.recommended_id);
            setProperties(data.properties || []);
            setError(null);
        } catch (err) {
            setError('AI Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = () => {
        if (isAiSearch) performAiSearch();
        else fetchAll();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearchSubmit();
    };

    const handleClearFilters = () => {
        const cleared = { property_type: '', min_price: '', max_price: '', preferred_tenant: '', pet_friendly: false };
        setFilters(cleared);
        setSearch('');
        setAiInput('');
        setAiAnswer(null);
        fetchAll(cleared);
    };

    const handleToggleWishlist = async (id, isSaved) => {
        try {
            if (isSaved) {
                await propertyService.unsaveProperty(id);
                setSavedPropertyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            } else {
                await propertyService.saveProperty(id);
                setSavedPropertyIds(prev => { const n = new Set(prev); n.add(id); return n; });
            }
            window.dispatchEvent(new Event('wishlist_updated'));
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
        }
    };

    return (
        <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark pb-24">

            <div className="pt-32 px-4 sm:px-6 lg:px-8">
                {/* The Sleek Search Pill */}
                <div className="relative mb-16 mx-auto max-w-4xl">
                    <div className={`
                        flex items-center bg-white border rounded-full p-2 pl-6 transition-all duration-300
                        ${isAiSearch
                            ? 'border-brand-blue-primary shadow-[0_0_20px_rgba(42,121,192,0.1)]'
                            : 'border-brand-gray-light shadow-sm hover:shadow-md hover:border-brand-gray-medium'}
                    `}>
                        {/* Unified Search Input */}
                        <div className="flex-1 flex items-center min-w-0">
                            {isAiSearch ? (
                                <div className="text-brand-blue-primary shrink-0 mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" /></svg>
                                </div>
                            ) : (
                                <div className="text-brand-gray-light shrink-0 mr-3">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder={isAiSearch ? "Describe your ideal home..." : "Search city, state or title"}
                                value={isAiSearch ? aiInput : search}
                                onChange={e => isAiSearch ? setAiInput(e.target.value) : setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm font-bold text-brand-gray-dark placeholder:text-brand-gray-light"
                            />
                        </div>

                        {/* Subtle Toggles Section */}
                        <div className="flex items-center gap-3 px-4 py-1 border-l border-brand-gray-light">
                            <div className="flex gap-1 p-0.5 bg-brand-offwhite rounded-full">
                                <button
                                    onClick={() => setIsAiSearch(false)}
                                    className={`px-3 py-1.5 text-[10px] uppercase font-black rounded-full transition-all ${!isAiSearch ? 'bg-white text-brand-blue-primary shadow-xs' : 'text-brand-gray-medium hover:text-brand-gray-dark'}`}
                                >
                                    Classic
                                </button>
                                <button
                                    onClick={() => setIsAiSearch(true)}
                                    className={`px-3 py-1.5 text-[10px] uppercase font-black rounded-full transition-all ${isAiSearch ? 'bg-brand-blue-primary text-white' : 'text-brand-gray-medium hover:text-brand-gray-dark'}`}
                                >
                                    AI
                                </button>
                            </div>

                            {!isAiSearch && (
                                <button
                                    onClick={() => setShowMap(!showMap)}
                                    className="p-2 text-brand-gray-medium hover:text-brand-blue-primary transition-colors hover:bg-brand-blue-primary/5 rounded-full"
                                    title={showMap ? "List View" : "Map View"}
                                >
                                    {showMap ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={handleSearchSubmit}
                                className={`
                                    p-2.5 rounded-full transition-all active:scale-90
                                    ${isAiSearch ? 'bg-brand-blue-primary text-white shadow-md' : 'bg-brand-gray-dark text-white hover:bg-black'}
                                `}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar Filters */}
                    {!isAiSearch && (
                        <aside className="w-full lg:w-72 shrink-0 animate-in slide-in-from-left-4 duration-500">
                            {/* CSS-only Mobile Accordion Toggle */}
                            <div className="bg-white rounded-[24px] lg:rounded-premium border border-brand-gray-light shadow-sm overflow-hidden mb-8">
                                <input type="checkbox" id="mobile-filters-toggle" className="peer hidden lg:hidden" />
                                
                                <label htmlFor="mobile-filters-toggle" className="flex items-center justify-between p-6 lg:p-8 lg:pb-4 cursor-pointer lg:cursor-default border-b border-transparent peer-checked:border-brand-gray-light lg:border-b lg:border-brand-gray-light transition-colors">
                                    <h3 className="font-black text-brand-gray-dark tracking-tight flex items-center gap-2">
                                        <svg className="w-5 h-5 text-brand-blue-primary lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                        Filters
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <button onClick={(e) => { e.preventDefault(); handleClearFilters(); }} className="text-xs font-bold text-brand-blue-primary hover:text-brand-blue-dark">
                                            Reset
                                        </button>
                                        <svg className="w-5 h-5 text-brand-gray-medium transition-transform duration-300 peer-checked:rotate-180 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </label>

                                <div className="grid grid-rows-[0fr] opacity-0 lg:grid-rows-[1fr] lg:opacity-100 transition-all duration-500 peer-checked:grid-rows-[1fr] peer-checked:opacity-100">
                                    <div className="overflow-hidden">
                                        <div className="p-6 lg:p-8 lg:pt-8 space-y-8">
                                            <div>
                                                <label className="text-xs font-black text-brand-gray-medium uppercase tracking-widest block mb-4">Property Type</label>
                                                <select
                                                    value={filters.property_type}
                                                    onChange={e => setFilters({ ...filters, property_type: e.target.value })}
                                                    className="w-full bg-brand-offwhite border-none rounded-radius-button px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-blue-primary/20 appearance-none pr-8 cursor-pointer"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238BA8B6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                                                >
                                                    <option value="">Any Type</option>
                                                    {['Apartment', 'House', 'Villa', 'PG', 'Hostel', 'Room'].map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-xs font-black text-brand-gray-medium uppercase tracking-widest block mb-4">Price Range (₹)</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        placeholder="Min"
                                                        value={filters.min_price}
                                                        onChange={e => setFilters({ ...filters, min_price: e.target.value })}
                                                        className="w-full bg-brand-offwhite border-none rounded-radius-button px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-brand-blue-primary/20"
                                                    />
                                                    <span className="text-brand-gray-medium">—</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Max"
                                                        value={filters.max_price}
                                                        onChange={e => setFilters({ ...filters, max_price: e.target.value })}
                                                        className="w-full bg-brand-offwhite border-none rounded-radius-button px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-brand-blue-primary/20"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-black text-brand-gray-medium uppercase tracking-widest block mb-4">Preferred Tenant</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['Male', 'Female', 'Family', 'Couple'].map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setFilters({ ...filters, preferred_tenant: filters.preferred_tenant === t ? '' : t })}
                                                            className={`py-2 px-3 rounded-radius-button text-[10px] font-black tracking-wider transition-all border ${filters.preferred_tenant === t ? 'bg-brand-blue-primary border-brand-blue-primary text-white shadow-md' : 'bg-brand-offwhite border-transparent text-brand-gray-medium hover:text-brand-gray-dark'}`}
                                                        >
                                                            {t.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-10 h-6 rounded-full transition-colors relative ${filters.pet_friendly ? 'bg-brand-blue-primary' : 'bg-brand-gray-medium/30'}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={filters.pet_friendly}
                                                        onChange={e => setFilters({ ...filters, pet_friendly: e.target.checked })}
                                                    />
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${filters.pet_friendly ? 'translate-x-4' : ''}`} />
                                                </div>
                                                <span className="text-xs font-bold text-brand-gray-dark">Pet Friendly</span>
                                            </label>

                                            <Button variant="primary" fullWidth className="py-4 shadow-lg shadow-brand-blue-primary/20" onClick={() => fetchAll()}>
                                                Apply Filters
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </aside>
                    )}

                    {/* Main Content Area */}
                    <main className="flex-1">
                        {/* AI Summary Box */}
                        {isAiSearch && aiAnswer && (
                            <div className="mb-10 p-8 bg-brand-blue-primary/5 border border-brand-blue-primary/10 rounded-premium flex items-start gap-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="w-14 h-14 bg-brand-blue-primary rounded-premium shadow-xl flex items-center justify-center shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.593-1.003l-.548-.547z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-brand-blue-primary font-black text-xl mb-2">Ez-Stay AI Insight</h3>
                                    <p className="text-brand-gray-dark font-medium leading-relaxed italic">"{aiAnswer}"</p>
                                </div>
                            </div>
                        )}

                        {/* Error Handling */}
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 p-8 rounded-premium flex items-center justify-between mb-10">
                                <p className="text-rose-800 font-bold">{error}</p>
                                <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-100" onClick={() => fetchAll()}>Retry</Button>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-brand-gray-light animate-pulse rounded-premium shadow-sm" />
                                ))}
                            </div>
                        ) : properties.length > 0 ? (
                            showMap ? (
                                <div className="w-full h-[600px] rounded-[32px] overflow-hidden shadow-sm border border-brand-gray-light relative animate-in fade-in duration-500" style={{ zIndex: 1 }}>
                                    <MapContainer
                                        key={properties.length}
                                        center={properties.find(p => p.latitude && p.longitude) ? [Number(properties.find(p => p.latitude && p.longitude).latitude), Number(properties.find(p => p.latitude && p.longitude).longitude)] : [10.0, 76.3]}
                                        zoom={12}
                                        style={{ height: '100%', width: '100%', borderRadius: '32px' }}
                                    >
                                        <MapRecenter
                                            lat={properties.find(p => p.latitude && p.longitude)?.latitude}
                                            lng={properties.find(p => p.latitude && p.longitude)?.longitude}
                                        />
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {properties.filter(p => p.latitude && p.longitude).map(property => (
                                            <Marker key={property.id} position={[Number(property.latitude), Number(property.longitude)]}>
                                                <Popup minWidth={200}>
                                                    <div className="text-center p-1 w-48">
                                                        <h3 className="font-black text-brand-gray-dark text-sm mb-1 line-clamp-1">{property.title}</h3>
                                                        <p className="text-xs text-brand-gray-medium mb-2">{property.city}</p>
                                                        <p className="text-brand-blue-primary font-black mb-3">₹{Number(property.rent_price).toLocaleString('en-IN')}/mo</p>
                                                        <a href={`/listings/${property.id}`} target="_blank" rel="noopener noreferrer" className="block w-full bg-brand-blue-primary text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg text-center hover:bg-brand-blue-dark transition-colors">
                                                            View Details
                                                        </a>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {properties.map(property => (
                                        <div key={property.id} className="relative animate-in fade-in zoom-in-95 duration-500">
                                            {isAiSearch && recommendedId === property.id && (
                                                <div className="absolute -top-3 left-6 z-10 bg-brand-accent text-brand-blue-primary text-[10px] font-black px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20">
                                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                                    BEST MATCH
                                                </div>
                                            )}
                                            <PropertyCard
                                                property={property}
                                                isWishlisted={savedPropertyIds.has(property.id)}
                                                onToggleWishlist={(id, status) => handleToggleWishlist(property.id, status)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="bg-white border-2 border-dashed border-brand-gray-light rounded-[40px] py-32 flex flex-col items-center text-center px-6">
                                <div className="w-24 h-24 bg-brand-offwhite rounded-full flex items-center justify-center mb-10 text-brand-gray-medium">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <h3 className="text-3xl font-black text-brand-gray-dark mb-4">No Matches Found</h3>
                                <p className="text-brand-gray-medium font-bold max-w-[384px] mb-12">We couldn't find any properties matching your criteria in the catalog.</p>
                                <Button variant="outline" className="px-10 py-3" onClick={handleClearFilters}>Clear All Search Filters</Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BrowsePage;
