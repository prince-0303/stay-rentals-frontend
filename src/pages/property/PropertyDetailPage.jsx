import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoginPromptModal from '../../components/common/LoginPromptModal';
import { propertyService } from '../../services/propertyService';
import { chatService } from '../../services/chatService';
import api from '../../services/api';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="%23F3F4F6"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2394A3B4" text-anchor="middle" dy=".35em">Ez-Stay Premium</text></svg>';

const PropertyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImg, setActiveImg] = useState(0);

    const [isSaved, setIsSaved] = useState(false);
    const [compareList, setCompareList] = useState([]);

    const [visitDate, setVisitDate] = useState('');
    const [visitLoading, setVisitLoading] = useState(false);
    const [visitStatus, setVisitStatus] = useState(null);
    const [chatLoading, setChatLoading] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({
        overall_rating: 5, cleanliness_rating: 5, value_rating: 5, location_rating: 5, owner_behavior_rating: 5, review_text: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalMessage, setAuthModalMessage] = useState('');

    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    const currentUser = user; // Sustain backward compatibility if needed

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const data = await propertyService.getProperty(id);
                setProperty(data);

                if (data) {
                    const recent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
                    const exists = recent.findIndex(p => String(p.id) === String(id));
                    if (exists !== -1) {
                        recent.splice(exists, 1);
                    }
                    recent.unshift({
                        id: data.id,
                        title: data.title,
                        price: data.rent_price || data.price,
                        images: data.images,
                        city: data.city,
                        lister_name: data.lister_name || 'Host',
                        bedrooms: data.bedrooms,
                        bathrooms: data.bathrooms,
                        area_sqft: data.area_sqft
                    });
                    localStorage.setItem('recently_viewed', JSON.stringify(recent.slice(0, 10)));
                }

                if (currentUser) {
                    try {
                        const savedData = await propertyService.getSavedProperties();
                        const list = Array.isArray(savedData) ? savedData : savedData.results || [];
                        setIsSaved(list.some(p => String(p.property?.id || p.id) === String(id)));
                    } catch (e) { }
                }

                try {
                    const reviewData = await propertyService.getPropertyReviews(id);
                    setReviews(Array.isArray(reviewData) ? reviewData : reviewData.results || []);
                } catch (e) { }

            } catch (err) {
                setError(err.response?.status === 404 ? 'Property not found.' : 'Failed to load details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
        setCompareList(JSON.parse(localStorage.getItem('compare_list') || '[]'));
    }, [id]);

    const handleToggleSave = async () => {
        if (!currentUser) {
            setAuthModalMessage('Sign in to save this property to your wishlist!');
            setShowAuthModal(true);
            return;
        }
        try {
            if (isSaved) {
                await propertyService.unsaveProperty(id);
                setIsSaved(false);
            } else {
                await propertyService.saveProperty(id);
                setIsSaved(true);
            }
            window.dispatchEvent(new Event('wishlist_updated'));
        } catch (err) { }
    };

    const handleToggleCompare = () => {
        if (!property) return;
        const list = JSON.parse(localStorage.getItem('compare_list') || '[]');
        const exists = list.some(p => String(p.id) === String(property.id));

        let newList;
        if (exists) {
            newList = list.filter(p => String(p.id) !== String(property.id));
        } else {
            if (list.length >= 3) return alert('Max 3 properties for comparison.');
            newList = [...list, { id: property.id, title: property.title, price: property.rent_price || property.price, images: property.images, city: property.city }];
        }
        localStorage.setItem('compare_list', JSON.stringify(newList));
        setCompareList(newList);
        window.dispatchEvent(new Event('compare_updated'));
    };

    const handleRequestVisit = async () => {
        if (!currentUser) {
            setAuthModalMessage('Sign in to schedule a property visit!');
            setShowAuthModal(true);
            return;
        }
        if (!visitDate) return setVisitStatus('Select a date first.');
        try {
            setVisitLoading(true);
            await propertyService.requestVisit(id, visitDate);
            setVisitStatus('Visit requested successfully!');
        } catch (err) {
            setVisitStatus(err.response?.data?.error || 'Request failed.');
        } finally {
            setVisitLoading(false);
        }
    };

    const handleStartChat = async () => {
        if (!currentUser) {
            setAuthModalMessage('Sign in to chat with the property owner!');
            setShowAuthModal(true);
            return;
        }
        try {
            setChatLoading(true);
            const res = await chatService.startConversation(id);
            navigate(`/chat?conversation=${res.id}`);
        } catch (err) {
            alert('Failed to start chat.');
        } finally {
            setChatLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await propertyService.submitReview(id, reviewForm);
            setReviews([res, ...reviews]);
            setReviewForm({ overall_rating: 5, cleanliness_rating: 5, value_rating: 5, location_rating: 5, owner_behavior_rating: 5, review_text: '' });
        } catch (err) {
            alert('Review failed.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handlePayAdvance = async () => {
        if (!currentUser) {
            setAuthModalMessage('Sign in to make an advance payment for this property!');
            setShowAuthModal(true);
            return;
        }
        try {
            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!razorpayKey) {
                alert('Razorpay key is not configured.');
                return;
            }

            const orderData = await api.post(`/payments/create-order/${property.id}/`).then(r => r.data);

            const options = {
                key: razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Ez-Stay',
                description: `Advance payment for ${orderData.property_title}`,
                order_id: orderData.order_id,
                handler: async (response) => {
                    try {
                        await api.post('/payments/verify/', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        refetch();
                    } catch (err) {
                        alert('Payment verification failed. Contact support.');
                    }
                },
                prefill: {
                    name: orderData.user_name || user?.first_name || 'Resident',
                    email: orderData.user_email || user?.email || 'user@example.com',
                },
                theme: { color: '#1E40AF' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert('Failed to initiate payment. Please try again.');
        }
    };

    const images = property?.images && property.images.length > 0 ? property.images : [];
    const displayImages = images.length > 0 ? images.map(img => img.image_url) : [PLACEHOLDER];
    const isComparing = compareList.some(p => String(p.id) === String(id));

    const { isPaid, paidBy, amount, paidAt, loading: statusLoading, refetch } = usePaymentStatus(id);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const isOwner = user && property && (user.id === property.lister_id || user.id === property.lister?.id);

    if (loading || statusLoading) return <div className="min-h-screen bg-brand-offwhite animate-pulse" />;
    if (error) return (
        <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-black mb-4">{error}</h1>
            <Button variant="primary" onClick={() => navigate('/listings')}>Back to Browse</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">

            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                {/* Modern Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Link to="/listings" className="text-xs font-black text-brand-blue-primary uppercase tracking-widest hover:text-brand-blue-dark transition-colors">Properties</Link>
                            <span className="text-brand-gray-light">/</span>
                            <span className="text-xs font-bold text-brand-gray-medium">{property.title}</span>
                        </div>

                        {isPaid && (
                            <div className="bg-green-100 border border-green-400 text-green-800 rounded p-3 mb-6 font-bold flex items-center gap-2 animate-fadeIn">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ✅ Advance Paid — This property is booked.
                            </div>
                        )}

                        {isPaid && isOwner && (
                            <div className="bg-brand-blue-primary/5 border border-brand-blue-primary/20 rounded-2xl p-6 mb-8 text-sm text-brand-gray-dark shadow-sm">
                                <h4 className="font-black text-brand-blue-primary uppercase tracking-widest text-[10px] mb-4">Booking Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-[10px] text-brand-gray-medium font-bold uppercase mb-1">Booked by</p>
                                        <p className="font-black truncate">{paidBy}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-brand-gray-medium font-bold uppercase mb-1">Amount Received</p>
                                        <p className="font-black text-emerald-600">{formatCurrency(amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-brand-gray-medium font-bold uppercase mb-1">Paid on</p>
                                        <p className="font-black">{formatDate(paidAt)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-4">{property.title}</h1>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-brand-blue-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-sm font-bold text-brand-gray-medium">{property.city}, {property.state}</span>
                            </div>
                            {property.rating && (
                                <div className="flex items-center gap-1 bg-brand-accent/10 px-3 py-1 rounded-full">
                                    <svg className="w-3.5 h-3.5 text-brand-accent fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <span className="text-xs font-black text-brand-blue-primary">{property.rating} / 5.0</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <Button variant={isComparing ? "primary" : "outline"} className="px-6 border-brand-gray-light" onClick={handleToggleCompare}>
                            {isComparing ? "Remove Comparison" : "Add to Compare"}
                        </Button>
                        <button
                            onClick={handleToggleSave}
                            className={`p-4 rounded-premium transition-all border ${isSaved ? 'bg-red-500 text-white border-red-500' : 'bg-white text-brand-gray-dark border-brand-gray-light hover:border-red-500'}`}
                        >
                            <svg className={`w-6 h-6 ${isSaved ? 'fill-current' : 'none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </button>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-16 h-[500px]">
                    <div className="lg:col-span-3 h-full rounded-premium overflow-hidden bg-brand-gray-light relative group">
                        <img
                            src={displayImages[activeImg]}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="Main Prop"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                            <Badge variant="primary" className="bg-brand-blue-primary/80 backdrop-blur-md border-white/20">PREMIUM LISTING</Badge>
                        </div>
                    </div>
                    <div className="hidden lg:flex flex-col gap-4 h-full">
                        {displayImages.slice(1, 4).map((img, i) => (
                            <button key={i} onClick={() => setActiveImg(i + 1)} className="flex-1 rounded-premium overflow-hidden bg-brand-gray-light border-2 border-transparent hover:border-brand-blue-primary transition-all">
                                <img src={img} className="w-full h-full object-cover" alt="Sub Prop" />
                            </button>
                        ))}
                        {displayImages.length > 4 && (
                            <button className="flex-1 bg-brand-blue-primary text-white rounded-premium font-black text-sm flex items-center justify-center hover:bg-brand-blue-dark transition-colors">
                                + {displayImages.length - 4} MORE
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid Layout for Content & Booking */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Left Side: Property Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="bg-white p-10 rounded-premium border border-brand-gray-light shadow-sm">
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <div className="w-2 h-8 bg-brand-blue-primary rounded-full" />
                                Description
                            </h2>
                            <p className="text-brand-gray-medium font-medium leading-relaxed mb-10">
                                {property.description || "No description available for this property."}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8 border-y border-brand-gray-light">
                                <div className="text-center">
                                    <p className="text-[10px] font-black tracking-widest text-brand-gray-medium uppercase mb-2">Bedrooms</p>
                                    <p className="text-xl font-black text-brand-gray-dark">{property.bedrooms ?? 'N/A'}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black tracking-widest text-brand-gray-medium uppercase mb-2">Bathrooms</p>
                                    <p className="text-xl font-black text-brand-gray-dark">{property.bathrooms ?? 'N/A'}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black tracking-widest text-brand-gray-medium uppercase mb-2">Area</p>
                                    <p className="text-xl font-black text-brand-gray-dark">{property.area_sqft ? `${property.area_sqft} ft²` : 'N/A'}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black tracking-widest text-brand-gray-medium uppercase mb-2">Floor</p>
                                    <p className="text-xl font-black text-brand-gray-dark">{property.floor_number ?? property.floor ?? 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h3 className="text-xl font-black mb-6">World-class Amenities</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    {(property.amenities?.length > 0 ? property.amenities : ['Wi-Fi', 'Parking', 'Gym', 'Pool', 'Security', 'Power Backup']).map((a, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-brand-offwhite p-4 rounded-radius-button group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-brand-gray-light">
                                            <div className="w-8 h-8 rounded-full bg-brand-blue-primary/10 flex items-center justify-center text-brand-blue-primary group-hover:bg-brand-blue-primary group-hover:text-white transition-all">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="text-sm font-bold text-brand-gray-dark">{typeof a === 'string' ? a : a.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Reviews */}
                        <section className="bg-white p-10 rounded-premium border border-brand-gray-light shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-black">User Reviews</h2>
                                <Badge variant="neutral" className="bg-brand-gray-light">TOP RATED</Badge>
                            </div>

                            <div className="space-y-8 mb-12">
                                {reviews.length > 0 ? reviews.map((r, i) => (
                                    <div key={i} className="bg-brand-offwhite p-6 rounded-premium group hover:shadow-lg transition-all border border-transparent hover:border-brand-gray-light">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-brand-gray-light border-2 border-white shadow-sm overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-brand-gray-dark">{r.user_name || 'Premium Tenant'}</p>
                                                    <p className="text-[10px] font-bold text-brand-gray-medium uppercase tracking-widest">VERIFIED RESIDENT</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-brand-accent/20 px-3 py-1 rounded-full">
                                                <svg className="w-3 h-3 text-brand-accent fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                <span className="text-[10px] font-black text-brand-blue-primary">{r.overall_rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-brand-gray-medium italic">"{r.review_text}"</p>
                                    </div>
                                )) : <p className="text-sm text-brand-gray-medium italic">Be the first to share your experience with this premium property.</p>}
                            </div>

                            {currentUser && currentUser.role !== 'lister' && (
                                <form onSubmit={handleSubmitReview} className="bg-brand-gray-light/30 p-8 rounded-premium">
                                    <h3 className="font-black mb-6 uppercase tracking-widest text-xs">Share Your Experience</h3>
                                    <textarea
                                        className="w-full bg-white rounded-radius-button p-6 text-sm font-semibold focus:ring-2 focus:ring-brand-blue-primary/20 border-none mb-6 min-h-[120px]"
                                        placeholder="Tell other seekers about this stay..."
                                        value={reviewForm.review_text}
                                        onChange={e => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                                    />
                                    <Button variant="primary" isLoading={submittingReview} fullWidth className="py-4 shadow-xl">Submit My Review</Button>
                                </form>
                            )}
                        </section>
                    </div>

                    {/* Right Side: Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-brand-blue-primary rounded-[40px] p-10 text-white shadow-2xl relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="mb-10 flex justify-between items-end border-b border-white/10 pb-6 pointer-events-auto relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest text-brand-blue-muted uppercase mb-1">Monthly Rent</p>
                                        <h3 className="text-4xl font-black">₹{property.rent_price || property.price}</h3>
                                    </div>
                                    <Badge variant="accent" className="bg-brand-accent/90 text-brand-blue-primary font-black">RESERVE</Badge>
                                </div>

                                <div className="space-y-6 mb-10 relative z-10 pointer-events-auto">
                                    <div>
                                        <label className="text-[10px] font-black tracking-widest text-brand-blue-muted uppercase block mb-3">Preferred Visit Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-white/10 border border-white/20 rounded-radius-button py-4 px-6 text-sm font-black focus:ring-2 focus:ring-brand-accent/50 outline-none text-white appearance-none"
                                            value={visitDate}
                                            onChange={e => setVisitDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <Button
                                        variant="accent"
                                        fullWidth
                                        className="py-5 shadow-2xl text-lg hover:scale-105"
                                        onClick={handleRequestVisit}
                                        isLoading={visitLoading}
                                    >
                                        Schedule Visit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        className="py-5 border-white/20 text-white hover:bg-white hover:text-brand-blue-primary"
                                        onClick={handleStartChat}
                                        isLoading={chatLoading}
                                    >
                                        Message Lister
                                    </Button>

                                    {user && user.role === 'user' && (
                                        isPaid ? (
                                            <button
                                                disabled
                                                className="w-full bg-gray-300 text-gray-500 font-black py-4 px-8 rounded-2xl cursor-not-allowed flex items-center justify-center gap-3"
                                            >
                                                Advance Already Paid
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handlePayAdvance}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Pay Advance (2 Months Rent)
                                            </button>
                                        )
                                    )}
                                </div>

                                {visitStatus && (
                                    <div className="bg-white/10 p-4 rounded-radius-button border border-white/5 animate-in fade-in duration-300">
                                        <p className="text-xs font-black text-center text-brand-accent uppercase tracking-tighter">{visitStatus}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-premium border border-brand-gray-light p-8 flex items-center gap-6 shadow-sm">
                                <div className="w-16 h-16 rounded-[20px] bg-brand-gray-light overflow-hidden shrink-0 border-4 border-brand-offwhite shadow-md">
                                    <img src="https://i.pravatar.cc/150?u=lister" alt="Lister" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-brand-gray-medium tracking-widest uppercase mb-1">Lister Profile</p>
                                    <h4 className="font-black text-brand-gray-dark leading-tight">{property.lister_name || property.lister?.first_name || 'Professional Host'}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {property.lister_is_online ? (
                                            <>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-600 uppercase">Online Now</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Offline</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <LoginPromptModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                message={authModalMessage}
            />
        </div>
    );
};

export default PropertyDetailPage;
