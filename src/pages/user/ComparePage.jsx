import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { propertyService } from '../../services/propertyService';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="%23F3F4F6"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2394A3B4" text-anchor="middle" dy=".35em">Ez-Stay Premium</text></svg>';

const ComparePage = () => {
    const [compareList, setCompareList] = useState([]);
    const [aiPreference, setAiPreference] = useState('');
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadList = async () => {
            const localList = JSON.parse(localStorage.getItem('compare_list') || '[]');
            try {
                if (localList.length > 0) {
                    const fullProperties = await Promise.all(
                        localList.map(item => propertyService.getProperty(item.id))
                    );
                    setCompareList(fullProperties);
                } else {
                    setCompareList([]);
                }
            } catch (err) {
                console.error("Failed to fetch full property details", err);
                setCompareList(localList);
            }
        };
        loadList();

        const handleStorage = () => loadList();
        window.addEventListener('storage', handleStorage);
        window.addEventListener('compare_updated', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('compare_updated', handleStorage);
        };
    }, []);

    const handleClearCompare = () => {
        localStorage.removeItem('compare_list');
        setCompareList([]);
        setAiRecommendation(null);
        window.dispatchEvent(new Event('compare_updated'));
    };

    const handleRemoveItem = (id) => {
        const localList = JSON.parse(localStorage.getItem('compare_list') || '[]');
        const newList = localList.filter(p => String(p.id) !== String(id));
        localStorage.setItem('compare_list', JSON.stringify(newList));
        setCompareList(prev => prev.filter(p => String(p.id) !== String(id)));
        if (newList.length < 2) setAiRecommendation(null);
        window.dispatchEvent(new Event('compare_updated'));
    };

    const handleCompareWithAi = async () => {
        if (compareList.length < 2) return;
        try {
            setLoadingAi(true);
            setError(null);
            const ids = compareList.map(p => p.id);
            const res = await propertyService.compareProperties(ids, aiPreference);
            setAiRecommendation(res.recommendation || "Unable to generate a recommendation at this time.");
        } catch (err) {
            setError("Expert AI is temporarily unavailable. Please try again.");
        } finally {
            setLoadingAi(false);
        }
    };

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">
                <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-brand-gray-light">
                        <svg className="w-8 h-8 text-brand-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h1 className="text-4xl font-black mb-4">Nothing to Compare</h1>
                    <p className="text-brand-gray-medium font-bold max-w-[448px] mb-10">Add properties from the search results to see them side-by-side with AI-powered advice.</p>
                    <Link to="/listings">
                        <Button variant="primary" className="px-12 py-4 shadow-xl shadow-brand-blue-primary/10">Browse Properties</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">

            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter leading-none mb-4">Property Comparison</h1>
                        <p className="text-brand-gray-medium font-bold text-lg">Detailed side-by-side analysis of your top contenders.</p>
                    </div>
                    <button
                        onClick={handleClearCompare}
                        className="text-xs font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors pb-1 border-b-2 border-transparent hover:border-red-700"
                    >
                        Clear All
                    </button>
                </div>

                <div className="bg-white rounded-[40px] border border-brand-gray-light shadow-sm overflow-hidden mb-16">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-brand-gray-light">
                                    <th className="w-1/4 p-10 bg-brand-offwhite border-r border-brand-gray-light text-left">
                                        <Badge variant="neutral" className="bg-brand-gray-light/50 text-brand-gray-dark font-black tracking-widest mb-1">METRICS</Badge>
                                        <h2 className="text-xl font-black">Comparison Table</h2>
                                    </th>
                                    {compareList.map((p) => (
                                        <th key={p.id} className="w-1/4 p-10 relative group">
                                            <button
                                                onClick={() => handleRemoveItem(p.id)}
                                                className="absolute top-6 right-6 p-2 bg-brand-offwhite rounded-full text-brand-gray-medium hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                            <div className="h-48 rounded-3xl overflow-hidden mb-6 bg-brand-gray-light shadow-md border-4 border-brand-offwhite">
                                                <img
                                                    src={p.images?.length > 0 ? p.images[0].image_url : PLACEHOLDER}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    alt={p.title}
                                                />
                                            </div>
                                            <Link to={`/listings/${p.id}`} className="text-lg font-black text-brand-gray-dark hover:text-brand-blue-primary transition-colors block leading-tight">
                                                {p.title}
                                            </Link>
                                            <p className="text-xs font-bold text-brand-gray-medium mt-1 uppercase tracking-tighter">{p.city}</p>
                                        </th>
                                    ))}
                                    {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                                        <th key={`empty-${i}`} className="w-1/4 p-10 bg-brand-offwhite/30 border-l border-brand-gray-light">
                                            <Link to="/listings" className="h-48 rounded-3xl border-2 border-dashed border-brand-gray-light flex flex-col items-center justify-center text-brand-gray-light gap-2 hover:border-brand-blue-primary hover:text-brand-blue-primary transition-all cursor-pointer">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                <p className="text-[10px] font-black uppercase tracking-widest">Add Property</p>
                                            </Link>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {/* Row Template */}
                                {[
                                    { label: 'Monthly Rent', key: 'rent_price', format: (v) => <span className="text-xl font-black text-brand-blue-primary">₹{v || 'N/A'}</span> },
                                    { label: 'Property Type', key: 'property_type', format: (v) => <span className="font-bold capitalize">{v ? v.replace('_', ' ') : 'N/A'}</span> },
                                    { label: 'Space Details', format: (p) => <span className="font-bold text-brand-gray-medium">{p.bedrooms ? `${p.bedrooms} HB` : ''} {p.area_sqft ? `• ${p.area_sqft} ft²` : ''}</span> },
                                    { label: 'Lifestyle', format: (p) => <Badge variant="neutral" className="bg-brand-offwhite text-brand-blue-primary">{p.pet_friendly ? 'Pet Friendly' : 'No Pets'}</Badge> },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-brand-gray-light hover:bg-brand-offwhite/50 transition-colors">
                                        <td className="p-8 border-r border-brand-gray-light bg-brand-offwhite/30 font-black text-brand-gray-medium uppercase tracking-widest text-[10px]">{row.label}</td>
                                        {compareList.map(p => (
                                            <td key={p.id} className="p-8">{row.format ? (row.key ? row.format(p[row.key]) : row.format(p)) : p[row.key]}</td>
                                        ))}
                                        {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-8 bg-brand-offwhite/10"></td>)}
                                    </tr>
                                ))}

                                <tr className="hover:bg-brand-offwhite/50 transition-colors">
                                    <td className="p-8 border-r border-brand-gray-light bg-brand-offwhite/30 font-black text-brand-gray-medium uppercase tracking-widest text-[10px] align-top">Amenities</td>
                                    {compareList.map(p => (
                                        <td key={p.id} className="p-8 align-top">
                                            <div className="flex flex-wrap gap-2">
                                                {(p.amenities || []).slice(0, 4).map((a, j) => (
                                                    <span key={j} className="text-[10px] font-black text-brand-gray-dark bg-brand-offwhite px-2 py-1 rounded-md uppercase tracking-tighter">
                                                        {typeof a === 'string' ? a : a.name}
                                                    </span>
                                                ))}
                                                {(p.amenities?.length > 4) && (
                                                    <span className="text-[10px] font-black text-brand-gray-medium">+{p.amenities.length - 4}</span>
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-8 bg-brand-offwhite/10"></td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Advice Section */}
                {compareList.length >= 2 && (
                    <section className="bg-brand-blue-primary rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl -ml-40 -mb-40 transition-transform duration-1000 group-hover:scale-125" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                            <div className="lg:col-span-2">
                                <Badge variant="accent" className="bg-brand-accent text-brand-blue-primary font-black mb-6">Ez-Stay ADVISOR</Badge>
                                <h2 className="text-3xl font-black mb-6 leading-tight">Which one is right for you?</h2>
                                <p className="text-brand-blue-muted font-bold mb-8">Tell us about your lifestyle preferences, and our proprietary AI will analyze these properties to find your perfect match.</p>

                                <textarea
                                    className="w-full bg-white/10 border border-white/20 rounded-3xl p-6 text-sm font-bold focus:ring-2 focus:ring-brand-accent/50 outline-none placeholder:text-brand-blue-muted min-h-[120px] transition-all"
                                    placeholder="e.g. I work from home and need a quiet space with fast fiber optics..."
                                    value={aiPreference}
                                    onChange={e => setAiPreference(e.target.value)}
                                />

                                <Button
                                    variant="accent"
                                    className="mt-6 py-4 px-10 shadow-2xl"
                                    onClick={handleCompareWithAi}
                                    isLoading={loadingAi}
                                    disabled={!aiPreference.trim()}
                                >
                                    Get AI Advice
                                </Button>
                            </div>

                            <div className="lg:col-span-3">
                                {error ? (
                                    <div className="bg-red-500/10 backdrop-blur-md rounded-[32px] p-10 border border-red-500/30 text-white animate-in fade-in slide-in-from-right-8 duration-500">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            </div>
                                            <h3 className="text-xl font-black text-red-400">Service Error</h3>
                                        </div>
                                        <p className="text-lg font-medium leading-relaxed opacity-90">{error}</p>
                                        <button
                                            onClick={() => setError(null)}
                                            className="mt-8 text-xs font-black uppercase tracking-widest text-red-400 hover:text-white transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : aiRecommendation ? (
                                    <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-10 border border-white/10 animate-in fade-in slide-in-from-right-8 duration-500">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-brand-blue-primary">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3V10H20L11 21V14H4L13 3Z" /></svg>
                                            </div>
                                            <h3 className="text-xl font-black">Expert Recommendation</h3>
                                        </div>
                                        <p className="text-lg font-medium leading-relaxed opacity-90 italic">"{aiRecommendation}"</p>
                                        <button
                                            onClick={() => setAiRecommendation(null)}
                                            className="mt-8 text-xs font-black uppercase tracking-widest text-brand-accent hover:text-white transition-colors"
                                        >
                                            Try another scenario
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                        <div className="w-20 h-20 border-4 border-white border-dashed rounded-full flex items-center justify-center mb-6">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14H11V21L20 10H13Z" /></svg>
                                        </div>
                                        <p className="font-black text-xl">Enter your requirements <br />to unlock AI advice.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default ComparePage;
