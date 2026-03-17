import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import PropertyCard from '../../components/property/PropertyCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { propertyService } from '../../services/propertyService';

const RecommendationsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('query');

    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [aiAnswer, setAiAnswer] = useState(null);
    const [error, setError] = useState(null);

    // Form state
    const [city, setCity] = useState('');
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [amenityInput, setAmenityInput] = useState('');
    const [preferredTenant, setPreferredTenant] = useState('');
    const [petFriendly, setPetFriendly] = useState(false);

    const [savedPropertyIds, setSavedPropertyIds] = useState(new Set());

    const fetchSaved = async () => {
        try {
            const data = await propertyService.getSavedProperties();
            const list = Array.isArray(data) ? data : data.results || [];
            setSavedPropertyIds(new Set(list.map(p => p.property?.id || p.id)));
        } catch (err) {
            console.error('Failed to fetch saved properties', err);
        }
    };

    const fetchPreferencesAndRecommendations = async () => {
        try {
            setLoading(true);
            const prefData = await propertyService.getPreferences();

            setPreferences(prefData);
            setCity(prefData.preferred_city || '');
            setMinBudget(prefData.min_budget || '');
            setMaxBudget(prefData.max_budget || '');
            setPropertyTypes(prefData.property_types || []);
            setAmenities(prefData.required_amenities || []);
            setPreferredTenant(prefData.preferred_tenants || '');
            setPetFriendly(prefData.pet_friendly || false);

            if (query) {
                const aiData = await propertyService.aiSearch(query);
                setAiAnswer(aiData.answer);
                setRecommendations(aiData.properties || []);
            } else {
                const recData = await propertyService.getRecommendations();
                setRecommendations(Array.isArray(recData) ? recData : recData.recommendations || []);
            }
        } catch (err) {
            if (err.response?.status !== 404 && err.response?.status !== 401) {
                setError('Failed to load personalized content.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreferencesAndRecommendations();
        fetchSaved();
    }, [query]);

    const handleSavePreferences = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = {
                preferred_city: city,
                min_budget: minBudget || null,
                max_budget: maxBudget || null,
                property_types: propertyTypes,
                required_amenities: amenities,
                preferred_tenants: preferredTenant,
                pet_friendly: petFriendly
            };
            await propertyService.updatePreferences(data);
            setPreferences(data);
            setAiAnswer(null);
            if (query) setSearchParams({});

            const recData = await propertyService.getRecommendations();
            setRecommendations(Array.isArray(recData) ? recData : recData.recommendations || []);
            setError(null);
        } catch (err) {
            setError('Failed to update your preferences.');
        } finally {
            setLoading(false);
        }
    };

    const handleAmenityKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = amenityInput.trim();
            if (val && !amenities.includes(val)) {
                setAmenities([...amenities, val]);
                setAmenityInput('');
            }
        }
    };

    const removeAmenity = (am) => {
        setAmenities(amenities.filter(a => a !== am));
    };

    const handleTypeChange = (e) => {
        const val = e.target.value;
        if (e.target.checked) {
            setPropertyTypes([...propertyTypes, val]);
        } else {
            setPropertyTypes(propertyTypes.filter(t => t !== val));
        }
    };

    return (
        <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">

            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                <div className="mb-12">
                    <h1 className="text-4xl font-black tracking-tighter leading-none mb-4">Personalized Picks</h1>
                    <p className="text-brand-gray-medium font-bold text-lg">Curated properties based on your unique profile and AI insights.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                    {/* Left Panel: Preferences */}
                    <aside className="lg:col-span-1 space-y-8 sticky top-32">
                        <section className="bg-white p-8 rounded-premium border border-brand-gray-light shadow-sm">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-brand-blue-primary rounded-full" />
                                My Profile
                            </h2>

                            <form onSubmit={handleSavePreferences} className="space-y-6">
                                <Input
                                    label="Target City"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    placeholder="e.g. Mumbai"
                                    className="text-sm font-bold"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Min Budget"
                                        type="number"
                                        value={minBudget}
                                        onChange={e => setMinBudget(e.target.value)}
                                        placeholder="Min"
                                        className="text-sm font-bold"
                                    />
                                    <Input
                                        label="Max Budget"
                                        type="number"
                                        value={maxBudget}
                                        onChange={e => setMaxBudget(e.target.value)}
                                        placeholder="Max"
                                        className="text-sm font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-brand-gray-medium uppercase block mb-3">Property Styles</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Apartment', 'House', 'PG', 'Villa'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    const exists = propertyTypes.includes(type);
                                                    setPropertyTypes(exists ? propertyTypes.filter(t => t !== type) : [...propertyTypes, type]);
                                                }}
                                                className={`px-4 py-2 rounded-full text-xs font-black transition-all border ${propertyTypes.includes(type) ? 'bg-brand-blue-primary text-white border-brand-blue-primary' : 'bg-brand-offwhite text-brand-gray-medium border-transparent hover:border-brand-gray-light'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-brand-gray-medium uppercase block mb-3">Required Amenities</label>
                                    <input
                                        type="text"
                                        value={amenityInput}
                                        onChange={e => setAmenityInput(e.target.value)}
                                        onKeyDown={handleAmenityKeyDown}
                                        placeholder="Add & Enter..."
                                        className="w-full bg-brand-offwhite border border-transparent rounded-radius-button py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-brand-blue-primary/20 outline-none transition-all placeholder:text-brand-gray-light"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {amenities.map(am => (
                                            <Badge key={am} variant="primary" className="bg-brand-blue-primary/10 text-brand-blue-primary border-none flex items-center gap-1 pr-1">
                                                {am}
                                                <button type="button" onClick={() => removeAmenity(am)} className="hover:text-brand-blue-dark">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="pet-toggle"
                                        checked={petFriendly}
                                        onChange={e => setPetFriendly(e.target.checked)}
                                        className="w-5 h-5 rounded-md text-brand-blue-primary focus:ring-brand-blue-primary/20 bg-brand-offwhite border-brand-gray-light cursor-pointer"
                                    />
                                    <label htmlFor="pet-toggle" className="text-xs font-black text-brand-gray-dark cursor-pointer uppercase tracking-tight">Pet Friendly Only</label>
                                </div>

                                <Button type="submit" variant="primary" fullWidth isLoading={loading} className="py-4 shadow-lg shadow-brand-blue-primary/10">
                                    Update My Feed
                                </Button>
                            </form>
                        </section>
                    </aside>

                    {/* Right Panel: Recommendations */}
                    <div className="lg:col-span-3 space-y-12">
                        {aiAnswer && (
                            <div className="bg-brand-blue-primary rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
                                <div className="relative flex items-start gap-6">
                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                                        <svg className="w-5 h-5 text-brand-accent animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14H11V21L20 10H13Z" /></svg>
                                    </div>
                                    <div>
                                        <Badge variant="accent" className="bg-brand-accent text-brand-blue-primary font-black mb-3">Ez-Stay AI INSIGHT</Badge>
                                        <p className="text-lg font-bold leading-relaxed opacity-90">{aiAnswer}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-100 p-6 rounded-premium flex items-center gap-4">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <p className="text-sm font-black text-red-800 uppercase tracking-tight">{error}</p>
                            </div>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-premium overflow-hidden border border-brand-gray-light aspect-[4/5] animate-pulse" />
                                ))}
                            </div>
                        ) : recommendations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {recommendations.map(property => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                        isWishlisted={savedPropertyIds.has(property.id)}
                                        onToggleWishlist={async (id, isSaved) => {
                                            try {
                                                if (isSaved) {
                                                    await propertyService.unsaveProperty(property.id);
                                                    setSavedPropertyIds(prev => { const n = new Set(prev); n.delete(property.id); return n; });
                                                } else {
                                                    await propertyService.saveProperty(property.id);
                                                    setSavedPropertyIds(prev => { const n = new Set(prev); n.add(property.id); return n; });
                                                }
                                                window.dispatchEvent(new Event('wishlist_updated'));
                                            } catch (e) { }
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-brand-gray-light rounded-[40px] py-32 flex flex-col items-center justify-center text-center px-6">
                                <div className="w-20 h-20 bg-brand-offwhite rounded-3xl flex items-center justify-center text-brand-gray-light mb-8">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.054.585M19.428 15.428V19a2 2 0 01-2 2H6.572a2 2 0 01-2-2v-3.572M19.428 15.428a2 2 0 00.199-1.539l-.312-1.248a2 2 0 00-1.94-1.514H6.625a2 2 0 00-1.941 1.514l-.312 1.248a2 2 0 00.199 1.539" /></svg>
                                </div>
                                <h3 className="text-2xl font-black mb-4">Finding Your Match...</h3>
                                <p className="text-brand-gray-medium font-bold max-w-[384px] w-full mb-10">Set your preferences and our AI will scour the city for properties that match your lifestyle.</p>
                                <Button variant="outline" className="px-10 py-4 border-brand-gray-light">Learn How It Works</Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default RecommendationsPage;
