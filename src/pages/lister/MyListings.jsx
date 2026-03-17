import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Footer from '../../components/common/Footer';
import ListerPropertyCard from '../../components/lister/ListerPropertyCard';
import { propertyService } from '../../services/propertyService';

const MyListings = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await propertyService.getMyProperties();
            setProperties(data);
            setError(null);
        } catch (err) {
            setError("Error loading your properties. Please try again.");
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent erasure requested. Are you certain you wish to remove this property from the Ez-Stay catalog?")) return;

        try {
            await propertyService.deleteProperty(id);
            setProperties(properties.filter(p => p.id !== id));
        } catch (err) {
            alert("Failed to delete property.");
        }
    };

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center py-32 bg-white border border-brand-gray-light border-dashed rounded-[48px] text-center px-6">
            <div className="w-24 h-24 bg-brand-offwhite rounded-[32px] flex items-center justify-center mb-10 text-brand-gray-light shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h3 className="text-3xl font-black text-brand-gray-dark tracking-tighter mb-4">Portfolio Empty</h3>
            <p className="text-brand-gray-medium font-bold max-w-[384px] mb-12">
                Your Ez-Stay presence is currently inactive. Initialize your first property listing to begin engagement.
            </p>
            <Link to="/my-listings/create">
                <Button variant="primary" className="px-12 py-5 shadow-2xl shadow-brand-blue-primary/10">
                    Host New Property
                </Button>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">
            
            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter mb-2">My Portfolio</h1>
                        <p className="text-lg font-bold text-brand-blue-primary uppercase tracking-tighter">Command center for your Ez-Stay assets</p>
                    </div>

                    <Link to="/my-listings/create">
                        <Button variant="primary" className="px-10 py-4 shadow-xl shadow-brand-blue-primary/10 flex items-center gap-3">
                            <span className="text-xl leading-none font-light">+</span>
                            Host New Property
                        </Button>
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-red-500 rounded-full" />
                            <p className="text-sm font-black text-red-800 uppercase tracking-tight">{error}</p>
                        </div>
                        <button onClick={fetchProperties} className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-700 transition-colors">Retry</button>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white border border-brand-gray-light rounded-[40px] h-[500px] animate-pulse relative overflow-hidden">
                                <div className="h-64 bg-brand-offwhite w-full" />
                                <div className="p-8 space-y-6">
                                    <div className="h-8 bg-brand-offwhite rounded-xl w-3/4" />
                                    <div className="h-4 bg-brand-offwhite rounded-lg w-1/2" />
                                    <div className="pt-8 border-t border-brand-offwhite flex gap-4">
                                        <div className="h-12 bg-brand-offwhite rounded-2xl flex-1" />
                                        <div className="h-12 bg-brand-offwhite rounded-2xl w-12" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    properties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {properties.map(property => (
                                <ListerPropertyCard
                                    key={property.id}
                                    property={property}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        renderEmptyState()
                    )
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyListings;
