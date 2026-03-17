import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import PropertyCard from '../../components/property/PropertyCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { propertyService } from '../../services/propertyService';

const WishlistPage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savedPropertyIds, setSavedPropertyIds] = useState(new Set());

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await propertyService.getSavedProperties();
            const list = Array.isArray(data) ? data : data.results || [];
            const mappedProperties = list.map(item => item.property || item);
            setProperties(mappedProperties);
            setSavedPropertyIds(new Set(mappedProperties.map(p => p.id)));
            setError(null);
        } catch (err) {
            setError('Unable to load your collection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
        const handleWishlistUpdate = () => fetchWishlist();
        window.addEventListener('wishlist_updated', handleWishlistUpdate);
        return () => window.removeEventListener('wishlist_updated', handleWishlistUpdate);
    }, []);

    const handleToggleWishlist = async (id, isSaved) => {
        try {
            if (isSaved) {
                await propertyService.unsaveProperty(id);
                setProperties(prev => prev.filter(p => p.id !== id));
                setSavedPropertyIds(prev => { const n = new Set(prev); n.delete(id); return n; });
                window.dispatchEvent(new Event('wishlist_updated'));
            }
        } catch (error) {
            fetchWishlist();
        }
    };

    return (
        <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">

            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter leading-none mb-4">Saved Properties</h1>
                        <p className="text-brand-gray-medium font-bold text-lg">Your curated collection of premium living spaces.</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-premium flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <p className="text-sm font-black text-red-800 uppercase tracking-tight">{error}</p>
                        </div>
                        <Button variant="outline" className="border-red-100 text-red-800 hover:bg-red-50" onClick={fetchWishlist}>Retry</Button>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-premium overflow-hidden border border-brand-gray-light aspect-[4/5] animate-pulse" />
                        ))}
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {properties.map(property => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                isWishlisted={savedPropertyIds.has(property.id)}
                                onToggleWishlist={(id, status) => handleToggleWishlist(property.id, status)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-brand-gray-light rounded-[40px] py-32 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 bg-brand-offwhite rounded-3xl flex items-center justify-center text-brand-gray-light mb-8">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <h3 className="text-2xl font-black mb-4">Your collection is empty</h3>
                        <p className="text-brand-gray-medium font-bold max-w-[384px] w-full mb-10">Start saving properties that catch your eye to view them here later.</p>
                        <Link to="/listings">
                            <Button variant="primary" className="px-10 py-4 shadow-xl shadow-brand-blue-primary/10">Start Exploring</Button>
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default WishlistPage;
