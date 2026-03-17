import React, { useState, useRef, useEffect } from 'react';
import Button from '../Button';
import Input from '../Input';

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

const PropertyForm = ({ initialData = null, onSubmit, loading, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

    const [existingImages, setExistingImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]); // IDs of images marked for deletion

    const [newImages, setNewImages] = useState([]); // Array of File objects
    const [imagePreviews, setImagePreviews] = useState([]); // Array of ObjectURLs

    const [dragActive, setDragActive] = useState(false);
    const [tagInput, setTagInput] = useState({ amenities: '', nearest_landmarks: '' });
    const fileInputRef = useRef(null);

    // Initialize from props if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...DEFAULT_FORM_DATA,
                ...initialData,
                total_rooms: initialData.total_rooms ?? '',
                bathrooms: initialData.bathrooms ?? '',
                kitchens: initialData.kitchens ?? '',
                floor_number: initialData.floor_number ?? '',
                total_floors: initialData.total_floors ?? '',
                latitude: initialData.latitude ?? '',
                longitude: initialData.longitude ?? '',
                rent_price: initialData.rent_price ?? '',
                amenities: Array.isArray(initialData.amenities) ? initialData.amenities : [],
                nearest_landmarks: Array.isArray(initialData.nearest_landmarks) ? initialData.nearest_landmarks : [],
            });

            if (initialData.images && Array.isArray(initialData.images)) {
                setExistingImages(initialData.images);
            }
        }
    }, [initialData]);
    // Handle standard inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle tag inputs (amenities, landmarks)
    const handleTagInputKeyDown = (e, field) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = tagInput[field].trim();
            if (val && !formData[field].includes(val)) {
                setFormData(prev => ({
                    ...prev,
                    [field]: [...prev[field], val]
                }));
            }
            setTagInput(prev => ({ ...prev, [field]: '' }));
        }
    };

    const removeTag = (field, indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, index) => index !== indexToRemove)
        }));
    };

    // Handle Image Uploads
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave" || e.type === "drop") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
        }
    };

    const processFiles = (files) => {
        // Filter out non-images
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        const totalExistingCount = existingImages.length - deletedImages.length;
        const currentTotal = totalExistingCount + newImages.length;

        if (currentTotal + validFiles.length > 10) {
            alert("You can only upload a maximum of 10 images.");
            return;
        }

        setNewImages(prev => [...prev, ...validFiles]);

        // Create previews
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId) => {
        setDeletedImages(prev => [...prev, imageId]);
    };

    const handleNext = () => {
        // Validation for each step
        if (step === 1) {
            if (!formData.title || !formData.rent_price || formData.rent_price <= 0) {
                alert("Please fill required fields (Title, Rent Price)");
                return;
            }
        }

        setStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();

        // If user hits Enter on steps 1 or 2, just move to next step instead of submitting
        if (step < 3) {
            handleNext();
            return;
        }

        // Final validation before submission
        if (!formData.title || !formData.rent_price || formData.rent_price <= 0) {
            alert("Please fill required fields (Title, Rent Price)");
            setStep(1); // Jump back to step 1 if basic info is missing
            return;
        }

        if (!formData.address_line || !formData.city) {
            alert("Please fill required location fields (Address, City)");
            return;
        }

        onSubmit(formData, newImages, deletedImages);
    };

    // Render Steps
    const renderStep1 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-brand-gray-dark border-b pb-2 border-brand-gray-light">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Property Title *"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Spacious 2BHK in Downtown"
                    className="md:col-span-2"
                />

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full rounded-xl border-brand-gray-medium bg-white text-brand-gray-dark px-4 py-3 focus:ring-2 focus:ring-brand-blue-primary focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="Describe your property..."
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Property Type *</label>
                    <select
                        name="property_type"
                        value={formData.property_type}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-brand-gray-medium bg-white text-brand-gray-dark px-4 py-3 focus:ring-2 focus:ring-brand-blue-primary focus:border-transparent outline-none shadow-sm"
                    >
                        {PROPERTY_TYPES.map(type => (
                            <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Availability Status</label>
                    <select
                        name="availability_status"
                        value={formData.availability_status}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-brand-gray-medium bg-white text-brand-gray-dark px-4 py-3 focus:ring-2 focus:ring-brand-blue-primary focus:border-transparent outline-none shadow-sm"
                    >
                        {AVAILABILITY_STATUSES.map(type => (
                            <option key={type} value={type}>{type.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Rent Price (₹/month) *"
                    type="number"
                    name="rent_price"
                    value={formData.rent_price}
                    onChange={handleChange}
                    required
                    min="1"
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-brand-gray-dark border-b pb-2 border-brand-gray-light">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Total Rooms" type="number" name="total_rooms" min="0" value={formData.total_rooms} onChange={handleChange} />
                <Input label="Bathrooms" type="number" name="bathrooms" min="0" value={formData.bathrooms} onChange={handleChange} />
                <Input label="Kitchens" type="number" name="kitchens" min="0" value={formData.kitchens} onChange={handleChange} />

                <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Room Type</label>
                    <select name="room_type" value={formData.room_type} onChange={handleChange} className="w-full rounded-xl border border-brand-gray-medium bg-white px-4 py-3">
                        {ROOM_TYPES.map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Furnishing Status</label>
                    <select name="furnishing_status" value={formData.furnishing_status} onChange={handleChange} className="w-full rounded-xl border border-brand-gray-medium bg-white px-4 py-3">
                        {FURNISHING_STATUSES.map(type => <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-gray-dark mb-1">Preferred Tenants</label>
                    <select name="preferred_tenants" value={formData.preferred_tenants} onChange={handleChange} className="w-full rounded-xl border border-brand-gray-medium bg-white px-4 py-3">
                        {TENANT_PREFERENCES.map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
                    </select>
                </div>

                <Input label="Floor Number" type="number" name="floor_number" value={formData.floor_number} onChange={handleChange} />
                <Input label="Total Floors" type="number" name="total_floors" value={formData.total_floors} onChange={handleChange} />

                <div className="flex items-center space-x-3 h-full pt-6">
                    <input
                        type="checkbox"
                        id="pet_friendly"
                        name="pet_friendly"
                        checked={formData.pet_friendly}
                        onChange={handleChange}
                        className="w-5 h-5 text-brand-blue-primary rounded focus:ring-brand-blue-primary"
                    />
                    <label htmlFor="pet_friendly" className="text-sm font-medium text-brand-gray-dark">Pet Friendly</label>
                </div>

                {/* Tag Inputs */}
                <div className="md:col-span-3 mt-4 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-brand-gray-dark mb-1">Amenities (Type and press Enter)</label>
                        <div className="bg-white border border-brand-gray-medium rounded-xl p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-brand-blue-primary focus-within:border-transparent transition-all">
                            {formData.amenities.map((tag, idx) => (
                                <span key={idx} className="bg-brand-gray-light text-brand-gray-dark px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    {tag}
                                    <button type="button" onClick={() => removeTag('amenities', idx)} className="text-gray-500 hover:text-red-500 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center">&times;</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput.amenities}
                                onChange={(e) => setTagInput(prev => ({ ...prev, amenities: e.target.value }))}
                                onKeyDown={(e) => handleTagInputKeyDown(e, 'amenities')}
                                className="flex-1 min-w-[120px] outline-none bg-transparent px-2"
                                placeholder="e.g. WiFi, AC, Parking"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-gray-dark mb-1">Nearest Landmarks (Type and press Enter)</label>
                        <div className="bg-white border border-brand-gray-medium rounded-xl p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-brand-blue-primary focus-within:border-transparent transition-all">
                            {formData.nearest_landmarks.map((tag, idx) => (
                                <span key={idx} className="bg-brand-gray-light text-brand-gray-dark px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    {tag}
                                    <button type="button" onClick={() => removeTag('nearest_landmarks', idx)} className="text-gray-500 hover:text-red-500 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center">&times;</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput.nearest_landmarks}
                                onChange={(e) => setTagInput(prev => ({ ...prev, nearest_landmarks: e.target.value }))}
                                onKeyDown={(e) => handleTagInputKeyDown(e, 'nearest_landmarks')}
                                className="flex-1 min-w-[120px] outline-none bg-transparent px-2"
                                placeholder="e.g. Metro Station, Tech Park"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-brand-gray-dark border-b pb-2 border-brand-gray-light">Location & Images</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input label="Address Line" name="address_line" value={formData.address_line} onChange={handleChange} />
                </div>
                <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                <Input label="State" name="state" value={formData.state} onChange={handleChange} />
                <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />

                {/* Optional Geo */}
                <Input label="Latitude (Optional)" type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} />
                <Input label="Longitude (Optional)" type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} />
            </div>

            <div className="mt-8 border-t pt-6 border-brand-gray-light">
                <h4 className="font-bold text-brand-gray-dark mb-4">Property Images (Max 10)</h4>

                <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${dragActive ? 'border-brand-blue-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <p className="text-gray-600 font-medium tracking-wide">Drag and drop your images here</p>
                    <p className="text-gray-400 text-sm mt-1">or click to browse from your computer</p>
                </div>

                {/* Previews Grid */}
                {(existingImages.filter(img => !deletedImages.includes(img.id)).length > 0 || imagePreviews.length > 0) && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* Existing Images */}
                        {existingImages.filter(img => !deletedImages.includes(img.id)).map((img, idx) => (
                            <div key={`exist-${img.id}`} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                                <img src={img.image_url} alt="Property" className="w-full h-full object-cover" />
                                {img.is_primary && (
                                    <span className="absolute top-1 right-1 bg-brand-blue-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">PRIMARY</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(img.id)}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-400"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}

                        {/* New Upload Previews */}
                        {imagePreviews.map((preview, idx) => (
                            <div key={`new-${idx}`} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                                <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                {existingImages.filter(img => !deletedImages.includes(img.id)).length === 0 && idx === 0 && (
                                    <span className="absolute top-1 right-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">NEW PRIMARY</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(idx)}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-400"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-brand-gray-light overflow-hidden">
            {/* Progress Bar Header */}
            <div className="bg-brand-gray-light/30 border-b border-brand-gray-light px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full max-w-[384px]">
                    <div className="flex justify-between text-xs font-bold text-brand-gray-medium mb-2 uppercase tracking-wider">
                        <span className={step >= 1 ? 'text-brand-blue-primary' : ''}>Basic</span>
                        <span className={step >= 2 ? 'text-brand-blue-primary' : ''}>Details</span>
                        <span className={step >= 3 ? 'text-brand-blue-primary' : ''}>Images</span>
                    </div>
                    <div className="flex gap-1 h-2">
                        <div className={`h-full flex-1 rounded-l-full transition-colors duration-300 ${step >= 1 ? 'bg-brand-blue-primary' : 'bg-gray-200'}`} />
                        <div className={`h-full flex-1 transition-colors duration-300 ${step >= 2 ? 'bg-brand-blue-primary' : 'bg-gray-200'}`} />
                        <div className={`h-full flex-1 rounded-r-full transition-colors duration-300 ${step >= 3 ? 'bg-brand-blue-primary' : 'bg-gray-200'}`} />
                    </div>
                </div>
                <div className="text-sm font-bold text-brand-gray-dark">
                    Step {step} of 3
                </div>
            </div>

            <div className="p-6 sm:p-10">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>

            {/* Footer Navigation */}
            <div className="bg-brand-gray-light/10 border-t border-brand-gray-light px-6 py-4 flex justify-between items-center rounded-b-2xl">
                <Button
                    type="button"
                    variant="outline"
                    onClick={step === 1 ? onCancel : handlePrev}
                    disabled={loading}
                >
                    {step === 1 ? 'Cancel' : 'Back'}
                </Button>

                <Button
                    type="submit"
                    isLoading={loading}
                    className="bg-brand-blue-primary hover:bg-brand-blue-dark text-white shadow-md px-10"
                >
                    {step < 3 ? 'Next Step' : (initialData ? 'Save Changes' : 'Publish Listing')}
                </Button>
            </div>
        </form>
    );
};

export default PropertyForm;
