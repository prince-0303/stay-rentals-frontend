import React, { useState, useEffect } from 'react';
import Footer from '../../components/common/Footer';
import Button from '../../components/common/Button';
import { Link, useNavigate } from 'react-router-dom';

const PROPERTY_TYPES = ['Any Type', 'Apartment', 'House', 'Villa', 'Studio', 'Office', 'Shop'];
const PRICE_RANGES = [
    { label: 'Any Price', value: '' },
    { label: 'Under ₹5,000', value: '5000' },
    { label: 'Under ₹10,000', value: '10000' },
    { label: 'Under ₹25,000', value: '25000' },
    { label: 'Under ₹50,000', value: '50000' },
    { label: 'Under ₹1,00,000', value: '100000' },
];

const HeroSearchBar = () => {
    const navigate = useNavigate();
    const [aiMode, setAiMode] = useState(false);
    const [location, setLocation] = useState('');
    const [propertyType, setPropertyType] = useState('Any Type');
    const [maxPrice, setMaxPrice] = useState('');
    const [aiQuery, setAiQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (aiMode) {
            if (!aiQuery.trim()) return;
            navigate(`/listings?ai=true&query=${encodeURIComponent(aiQuery.trim())}`);
        } else {
            const params = new URLSearchParams();
            if (location.trim()) params.set('city', location.trim());
            if (propertyType !== 'Any Type') params.set('property_type', propertyType.toLowerCase());
            if (maxPrice) params.set('max_price', maxPrice);
            navigate(`/listings?${params.toString()}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-5xl mx-auto mt-12 mb-8">
            {/* AI Toggle - Modern switch */}
            <div className="flex justify-end mb-4 items-center gap-3">
                <span className={`text-xs font-black uppercase tracking-wider transition-colors ${aiMode ? 'text-brand-accent' : 'text-white/50'}`}>
                    AI Mode
                </span>
                <button
                    type="button"
                    onClick={() => setAiMode(m => !m)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none ${aiMode ? 'bg-brand-accent shadow-lg shadow-brand-accent/40' : 'bg-white/20'}`}
                    aria-label="Toggle AI Search"
                >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${aiMode ? 'translate-x-6 bg-brand-blue-primary' : 'translate-x-0 bg-white'}`}>
                        {aiMode && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        )}
                    </span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[28px] md:rounded-full p-3 flex flex-col md:flex-row shadow-2xl items-center w-full transition-all duration-300">
                {aiMode ? (
                    <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-2xl md:rounded-full px-5 py-4 w-full">
                        <svg className="w-5 h-5 text-brand-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <input
                            type="text"
                            value={aiQuery}
                            onChange={e => setAiQuery(e.target.value)}
                            placeholder="e.g. 2BHK apartment in Mumbai under ₹20,000..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/50 text-base font-medium w-full"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row w-full bg-white/5 md:bg-transparent rounded-2xl md:rounded-none p-1 md:p-0">
                        {/* Location */}
                        <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl md:rounded-none hover:bg-white/10 transition-colors">
                            <svg className="w-5 h-5 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="City or area..."
                                className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/60 text-base font-semibold"
                            />
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px h-10 bg-white/20 self-center mx-1" />
                        <div className="md:hidden w-full h-px bg-white/10 my-0.5" />

                        {/* Property Type & Price Row (Mobile) */}
                        <div className="flex flex-row items-center w-full md:w-auto">
                            {/* Property Type */}
                            <div className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3.5 rounded-xl md:rounded-none hover:bg-white/10 transition-colors relative">
                                <svg className="w-5 h-5 text-white/70 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <select
                                    value={propertyType}
                                    onChange={e => setPropertyType(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-white text-sm sm:text-base font-semibold cursor-pointer [&>option]:text-brand-gray-dark [&>option]:bg-white appearance-none pr-6 truncate"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0 center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                                >
                                    {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Vertical Divider Mobile/Desktop */}
                            <div className="w-px h-8 bg-white/10 self-center mx-1 md:hidden" />
                            <div className="hidden md:block w-px h-10 bg-white/20 self-center mx-1" />

                            {/* Max Price */}
                            <div className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3.5 rounded-xl md:rounded-none hover:bg-white/10 transition-colors relative">
                                <svg className="w-5 h-5 text-white/70 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <select
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-white text-sm sm:text-base font-semibold cursor-pointer [&>option]:text-brand-gray-dark [&>option]:bg-white appearance-none pr-6 truncate"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0 center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                                >
                                    {PRICE_RANGES.map(p => <option key={p.label} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Button */}
                <button
                    type="submit"
                    className={`shrink-0 px-8 py-4 mt-2 md:mt-0 ml-0 md:ml-3 rounded-[20px] md:rounded-full font-black text-base tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-lg whitespace-nowrap w-full md:w-auto ${aiMode
                        ? 'bg-brand-accent text-brand-blue-primary shadow-brand-accent/30'
                        : 'bg-brand-blue-primary text-white shadow-brand-blue-primary/40 hover:bg-brand-blue-dark'
                        }`}
                >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {aiMode ? 'Ask AI ✨' : 'Search Now'}
                </button>
            </div>

            {aiMode && (
                <p className="text-center text-white/50 text-xs font-medium mt-3">
                    Describe your ideal property in natural language — our AI will find the best matches
                </p>
            )}
        </form>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });

    useEffect(() => {
        const handleAuthChange = () => {
            try { setUser(JSON.parse(localStorage.getItem('user'))); } catch { setUser(null); }
        };
        window.addEventListener('auth-change', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);
        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
        };
    }, []);

    const steps = [
        {
            id: '01',
            title: 'Browse Listings',
            description: 'Explore our vast collection of verified premium properties customized to your location and style.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            )
        },
        {
            id: '02',
            title: 'Select & Review',
            description: 'Filter based on price, property type, and review detailed descriptions, photos, and ratings.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            )
        },
        {
            id: '03',
            title: 'Contact Lister',
            description: 'Connect directly with verified property listers via our instant messaging platform to arrange details.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            )
        },
        {
            id: '04',
            title: 'Move In',
            description: 'Finalize your booking smoothly and prepare to move into your new perfect space without hassle.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-white text-brand-gray-dark selection:bg-brand-blue-muted/30 font-sans">
            
            {/* 1. Landing Screen & Welcome Note */}
            <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden animate-fade-in pt-20 mt-0">
                {/* Full-width Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                        className="w-full h-full object-cover opacity-90 scale-105"
                        alt="Luxury Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-gray-dark/70 via-brand-gray-dark/40 to-brand-gray-dark/95" />
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center">
                    <div className="inline-flex py-1.5 px-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-6 shadow-xl">
                        Welcome to Ez-Stay
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-tight text-white drop-shadow-2xl mb-6 w-full">
                        Find Your Next{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-brand-blue-primary">
                            Perfect Space
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg lg:text-2xl text-gray-200 font-medium leading-relaxed max-w-3xl mx-auto mb-10 drop-shadow-md">
                        Search by location, type, and budget — or let our AI find the perfect property for you.
                    </p>

                    {/* Hero Search Bar */}
                    <div className="w-full max-w-4xl mx-auto">
                        <HeroSearchBar />
                    </div>
                </div>
            </section>


            {/* 2. Brief about the Site Moto / Theme */}
            <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 relative">
                        {/* Decorative Element */}
                        <div className="absolute -left-6 -top-6 w-24 h-24 bg-brand-blue-primary/10 rounded-full blur-2xl"></div>

                        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-brand-gray-dark leading-tight relative z-10">
                            Modern Living, <br />
                            <span className="text-brand-blue-primary">Simplified.</span>
                        </h2>
                        <p className="text-lg text-brand-gray-medium leading-relaxed font-medium">
                            Our motto is simple: <strong className="text-brand-gray-dark">Seamless housing for everyone.</strong> We believe that finding a new home shouldn't be a tedious chore filled with paperwork and endless scrolling.
                        </p>
                        <p className="text-lg text-brand-gray-medium leading-relaxed font-medium">
                            We've curated an ecosystem driven by transparency, intelligent design, and a dedication to quality. From vibrant city apartments to tranquil suburban villas, our theme is bringing you spaces that inspire your best life.
                        </p>
                        <div className="pt-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-1 bg-brand-blue-primary rounded-full"></div>
                                <span className="font-bold text-sm tracking-widest uppercase text-brand-gray-dark">Our Vision</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-[500px] rounded-[40px] overflow-hidden shadow-2xl group">
                        <img
                            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Modern Living"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-gray-dark/80 to-transparent flex items-end p-10">
                            <h3 className="text-white text-2xl font-bold">Experience the Future of Real Estate</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Step Guide on How to Book Listings */}
            <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-brand-offwhite rounded-[40px] my-12">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">How To Book <span className="text-brand-blue-primary">Listings</span></h2>
                    <p className="text-lg text-brand-gray-medium font-medium">We've streamlined the entire rental process into four easy steps. Your dream home is just a few clicks away.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-brand-gray-light group relative overflow-hidden flex flex-col">
                            {/* Step Number Watermark */}
                            <div className="absolute -right-4 -top-8 text-9xl font-black text-brand-offwhite group-hover:text-brand-blue-primary/5 transition-colors duration-300 pointer-events-none select-none">
                                {step.id}
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-brand-blue-primary/10 text-brand-blue-primary flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-blue-primary group-hover:text-white transition-all duration-300 relative z-10">
                                {step.icon}
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-brand-gray-dark relative z-10">{step.title}</h3>
                            <p className="text-brand-gray-medium leading-relaxed font-medium relative z-10 flex-grow">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Bottom Call to Action / Get Started Redirection */}
            <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto mb-10">
                <div className="bg-brand-blue-primary rounded-[40px] p-12 lg:p-20 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-1/2 h-full bg-black/10 blur-[80px] pointer-events-none" />

                    <div className="relative z-10 max-w-3xl">
                        <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-8">
                            Ready to unlock your <br /> new front door?
                        </h2>
                        <p className="text-blue-100 text-xl font-medium mb-10">
                            Join thousands of users who have found their perfect place. Start browsing our curated premium listings today.
                        </p>
                        <Button
                            variant="accent"
                            className="py-5 px-12 text-xl font-black tracking-tight shadow-xl hover:-translate-y-2 bg-white text-brand-blue-primary hover:bg-brand-offwhite rounded-full transition-all duration-300"
                            onClick={() => navigate('/listings')}
                        >
                            Start Browsing Now
                        </Button>
                    </div>
                </div>
            </section>

            {/* 5. Footer */}
            <Footer />
        </div>
    );
};

export default Home;
