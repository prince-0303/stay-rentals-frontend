import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PROPERTY_TYPES = ['apartment', 'house', 'room', 'villa', 'pg', 'hostel'];
const AVAILABILITY_STATUSES = ['available', 'booked', 'unavailable'];
const ROOM_TYPES = ['private', 'shared'];
const FURNISHING_STATUSES = ['furnished', 'semi_furnished', 'unfurnished'];
const TENANT_PREFERENCES = ['male', 'female', 'mixed', 'couple', 'family', 'any'];

const DEFAULT_FORM_DATA = {
    title: '',
    description: '',
    property_type: 'apartment',
    rent_price: '',
    availability_status: 'available',
    total_rooms: '',
    bathrooms: '',
    kitchens: '',
    room_type: 'private',
    furnishing_status: 'unfurnished',
    floor_number: '',
    total_floors: '',
    preferred_tenants: 'any',
    pet_friendly: false,
    amenities: [],
    nearest_landmarks: [],
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: ''
};

const LocationPicker = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

const PropertyForm = ({ initialData = null, onSubmit, loading, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [existingImages, setExistingImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [tagInput, setTagInput] = useState({ amenities: '', nearest_landmarks: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...DEFAULT_FORM_DATA,
                ...initialData,
                amenities: Array.isArray(initialData.amenities) ? initialData.amenities : [],
                nearest_landmarks: Array.isArray(initialData.nearest_landmarks) ? initialData.nearest_landmarks : [],
            });
            if (initialData.images) setExistingImages(initialData.images);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleTagInputKeyDown = (e, field) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = tagInput[field].trim();
            if (val && !formData[field].includes(val)) {
                setFormData(prev => ({ ...prev, [field]: [...prev[field], val] }));
            }
            setTagInput(prev => ({ ...prev, [field]: '' }));
        }
    };

    const removeTag = (field, indexToRemove) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, index) => index !== indexToRemove) }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length + existingImages.length - deletedImages.length + newImages.length > 10) {
            alert("Maximum 10 images reached.");
            return;
        }
        setNewImages(prev => [...prev, ...validFiles]);
        setImagePreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    };

    const removeNewImage = (idx) => {
        setNewImages(prev => prev.filter((_, i) => i !== idx));
        URL.revokeObjectURL(imagePreviews[idx]);
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step < 3) return handleNext();
        onSubmit(formData, newImages, deletedImages);
    };

    const StepIndicator = () => (
        <div className="flex items-center gap-4 mb-16">
            {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-brand-blue-primary text-white shadow-xl shadow-brand-blue-primary/20' : 'bg-brand-offwhite text-brand-gray-light border border-brand-gray-light'}`}>
                            0{s}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s ? 'text-brand-blue-primary' : 'text-brand-gray-light'}`}>
                            {s === 1 ? 'Foundations' : s === 2 ? 'Details' : 'Media'}
                        </span>
                    </div>
                    {s < 3 && <div className={`h-px flex-1 mb-6 ${step > s ? 'bg-brand-blue-primary' : 'bg-brand-gray-light'}`} />}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-brand-gray-light rounded-[48px] p-6 md:p-10 lg:p-16 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-primary/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />

            <StepIndicator />

            {step === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input label="PROPERTY TITLE" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Skyline Waterfront Apartment" className="md:col-span-2" />
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block mb-3 pl-2">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="5" className="w-full bg-brand-offwhite border-none rounded-[32px] px-8 py-6 font-bold text-brand-gray-dark outline-none focus:ring-2 focus:ring-brand-blue-primary/20 transition-all placeholder:text-brand-gray-light/50" placeholder="Narrate the lifestyle offered by this space..." />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block pl-2">Typology</label>
                            <select name="property_type" value={formData.property_type} onChange={handleChange} className="w-full bg-brand-offwhite border-none rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-[10px] text-brand-blue-primary outline-none focus:ring-2 focus:ring-brand-blue-primary/20">
                                {PROPERTY_TYPES.map(t => (
                                    <option key={t} value={t}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input label="RENTAL VALUE (₹/MO)" type="number" name="rent_price" value={formData.rent_price} onChange={handleChange} required />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Input label="BEDROOMS" type="number" name="total_rooms" value={formData.total_rooms} onChange={handleChange} />
                        <Input label="BATHROOMS" type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} />
                        <Input label="KITCHENS" type="number" name="kitchens" value={formData.kitchens} onChange={handleChange} />

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block pl-2">Furnishing</label>
                            <select name="furnishing_status" value={formData.furnishing_status} onChange={handleChange} className="w-full bg-brand-offwhite border-none rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-[10px] text-brand-blue-primary outline-none">
                                {FURNISHING_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block pl-2">Ideal Tenant</label>
                            <select name="preferred_tenants" value={formData.preferred_tenants} onChange={handleChange} className="w-full bg-brand-offwhite border-none rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-[10px] text-brand-blue-primary outline-none">
                                {TENANT_PREFERENCES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-4 h-full pt-8">
                            <input type="checkbox" id="pet_friendly" name="pet_friendly" checked={formData.pet_friendly} onChange={handleChange} className="w-6 h-6 rounded-lg text-brand-blue-primary border-brand-gray-light focus:ring-brand-blue-primary/20" />
                            <label htmlFor="pet_friendly" className="text-[10px] font-black uppercase tracking-widest text-brand-gray-dark cursor-pointer">Pet Inclusive</label>
                        </div>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-brand-gray-light">
                        {['amenities', 'nearest_landmarks'].map(field => (
                            <div key={field}>
                                <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block mb-4 pl-2">{field.replace('_', ' ')}</label>
                                <div className="flex flex-wrap gap-2 p-4 bg-brand-offwhite rounded-[24px]">
                                    {formData[field].map((tag, idx) => (
                                        <Badge key={idx} variant="primary" className="py-2 px-4 rounded-full flex items-center gap-2 group">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(field, idx)} className="hover:text-red-300 transition-colors">×</button>
                                        </Badge>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput[field]}
                                        onChange={(e) => setTagInput(prev => ({ ...prev, [field]: e.target.value }))}
                                        onKeyDown={(e) => handleTagInputKeyDown(e, field)}
                                        className="bg-transparent border-none outline-none font-bold text-xs px-4 flex-1 min-w-[200px]"
                                        placeholder={`Add ${field.replace('_', ' ')}...`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Input label="LOCATION ADDRESS" name="address_line" value={formData.address_line} onChange={handleChange} className="md:col-span-2" />
                        <Input label="CITY" name="city" value={formData.city} onChange={handleChange} />
                        <Input label="STATE" name="state" value={formData.state} onChange={handleChange} required />
                        <Input label="PINCODE" name="pincode" value={formData.pincode} onChange={handleChange} required />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-brand-gray-medium mb-3 pl-2">
                            Pin Exact Location <span className="text-brand-gray-light text-[9px] lowercase opacity-80 font-semibold">(Click on map to place pin)</span>
                        </label>
                        <div className="aspect-square md:aspect-auto md:h-[500px] rounded-3xl overflow-hidden border border-brand-gray-light shadow-sm relative z-0">
                            <MapContainer
                                center={formData.latitude && formData.longitude ? [Number(formData.latitude), Number(formData.longitude)] : [10.0, 76.3]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationPicker onLocationSelect={(lat, lng) => {
                                    setFormData(prev => ({ ...prev, latitude: parseFloat(lat.toFixed(6)), longitude: parseFloat(lng.toFixed(6)) }));
                                }} />
                                {formData.latitude && formData.longitude && (
                                    <Marker position={[Number(formData.latitude), Number(formData.longitude)]} />
                                )}
                            </MapContainer>
                        </div>
                        {formData.latitude && formData.longitude && (
                            <p className="text-[10px] text-brand-blue-primary font-black uppercase tracking-widest mt-3 pl-2 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                            </p>
                        )}
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block pl-2">Gallery (Max 10 images)</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-brand-offwhite border-2 border-dashed border-brand-gray-light rounded-[40px] p-20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue-primary hover:bg-white transition-all group"
                        >
                            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-brand-gray-light mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-brand-gray-medium">Upload Property Images</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                            {existingImages.filter(img => !deletedImages.includes(img.id)).map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-[32px] overflow-hidden group">
                                    <img src={img.image_url} alt="scan" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setDeletedImages(prev => [...prev, img.id])} className="absolute inset-0 bg-red-600/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white scale-110 group-hover:scale-100">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                            {imagePreviews.map((p, idx) => (
                                <div key={idx} className="relative aspect-square rounded-[32px] overflow-hidden group border-4 border-brand-accent">
                                    <img src={p} alt="new" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeNewImage(idx)} className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-20 pt-10 border-t border-brand-gray-light flex justify-between gap-6">
                <Button variant="outline" type="button" onClick={step === 1 ? onCancel : handlePrev} className="px-10 border-brand-gray-light uppercase text-[10px] font-black tracking-widest">
                    {step === 1 ? 'Discard' : 'Back'}
                </Button>
                <Button variant="primary" type="submit" isLoading={loading} className="px-16 py-5 shadow-2xl shadow-brand-blue-primary/10">
                    {step < 3 ? 'Synchronize Phase' : (initialData ? 'Update Assets' : 'Publish to Ez-Stay')}
                </Button>
            </div>
        </form>
    );
};

export default PropertyForm;
