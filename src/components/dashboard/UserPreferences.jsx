import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/propertyService';
import Input from '../common/Input';
import Button from '../common/Button';
import Badge from '../common/Badge';

const PROPERTY_TYPES = ['Apartment', 'House', 'Room', 'Villa', 'PG', 'Hostel'];
const AMENITIES = ['WiFi', 'Parking', 'AC', 'Food', 'Laundry', 'Gym', 'Security', 'Power Backup'];
const TENANT_TYPES = ['Male', 'Female', 'Mixed', 'Couple', 'Family', 'Any'];

const UserPreferences = () => {
    const [prefs, setPrefs] = useState({
        preferred_city: '',
        min_budget: '',
        max_budget: '',
        preferred_property_types: [],
        required_amenities: [],
        preferred_tenants: '',
        pet_friendly: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        propertyService.getPreferences()
            .then(data => { setPrefs(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        setPrefs({ ...prefs, [e.target.name]: e.target.value });
    };

    const toggleType = (type) => {
        const current = prefs.preferred_property_types || [];
        setPrefs({
            ...prefs,
            preferred_property_types: current.includes(type)
                ? current.filter(t => t !== type)
                : [...current, type]
        });
    };

    const toggleAmenity = (amenity) => {
        const current = prefs.required_amenities || [];
        setPrefs({
            ...prefs,
            required_amenities: current.includes(amenity)
                ? current.filter(a => a !== amenity)
                : [...current, amenity]
        });
    };

    const save = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await propertyService.updatePreferences(prefs);
            setMessage({ type: 'success', text: 'Digital profile updated successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to sync preferences.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="animate-pulse h-64 bg-brand-offwhite rounded-[40px]" />;

    return (
        <div className="space-y-12">
            <div>
                <h3 className="text-2xl font-black mb-2">Style & Lifestyle</h3>
                <p className="text-brand-gray-medium font-bold text-sm">Fine-tune your requirements to discover properties that resonate.</p>
            </div>

            <div className="bg-white border border-brand-gray-light p-10 rounded-[40px] shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Target Location" name="preferred_city" value={prefs.preferred_city || ''} onChange={handleChange} placeholder="e.g. South Mumbai" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Min Budget" type="number" name="min_budget" value={prefs.min_budget || ''} onChange={handleChange} placeholder="₹ Min" />
                        <Input label="Max Budget" type="number" name="max_budget" value={prefs.max_budget || ''} onChange={handleChange} placeholder="₹ Max" />
                    </div>
                </div>

                <div className="mt-12 space-y-10">
                    <section>
                        <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block mb-4">Architecture Styles</label>
                        <div className="flex flex-wrap gap-2">
                            {PROPERTY_TYPES.map(type => (
                                <button key={type} onClick={() => toggleType(type)}
                                    className={`px-5 py-2.5 rounded-full text-xs font-black transition-all border
                                        ${(prefs.preferred_property_types || []).includes(type)
                                            ? 'bg-brand-blue-primary text-white border-brand-blue-primary shadow-lg shadow-brand-blue-primary/10'
                                            : 'bg-brand-offwhite border-transparent text-brand-gray-medium hover:border-brand-gray-light'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block mb-4">Core Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {AMENITIES.map(amenity => (
                                <button key={amenity} onClick={() => toggleAmenity(amenity)}
                                    className={`px-5 py-2.5 rounded-full text-xs font-black transition-all border
                                        ${(prefs.required_amenities || []).includes(amenity)
                                            ? 'bg-brand-blue-primary text-white border-brand-blue-primary shadow-lg shadow-brand-blue-primary/10'
                                            : 'bg-brand-offwhite border-transparent text-brand-gray-medium hover:border-brand-gray-light'}`}>
                                    {amenity}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <section>
                            <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block mb-4">Tenant Dynamics</label>
                            <div className="flex flex-wrap gap-2">
                                {TENANT_TYPES.map(type => (
                                    <button key={type} onClick={() => setPrefs({ ...prefs, preferred_tenants: type })}
                                        className={`px-4 py-2 rounded-full text-xs font-black transition-all border capitalize
                                            ${prefs.preferred_tenants === type
                                                ? 'bg-brand-blue-primary text-white border-brand-blue-primary shadow-lg shadow-brand-blue-primary/10'
                                                : 'bg-brand-offwhite border-transparent text-brand-gray-medium hover:border-brand-gray-light'}`}>
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <label className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest block mb-4">Pet Policy</label>
                            <div className="flex gap-3">
                                {[{ label: 'Strictly Pet Friendly', value: true }, { label: 'No Pets', value: false }].map(opt => (
                                    <button key={opt.label} onClick={() => setPrefs({ ...prefs, pet_friendly: opt.value })}
                                        className={`px-5 py-2.5 rounded-full text-xs font-black transition-all border
                                            ${prefs.pet_friendly === opt.value
                                                ? 'bg-brand-blue-primary text-white border-brand-blue-primary shadow-lg shadow-brand-blue-primary/10'
                                                : 'bg-brand-offwhite border-transparent text-brand-gray-medium hover:border-brand-gray-light'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-brand-gray-light flex flex-col md:flex-row justify-between items-center gap-6">
                    {message.text && (
                        <p className={`text-xs font-black uppercase tracking-tight ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {message.text}
                        </p>
                    )}
                    <Button variant="primary" onClick={save} isLoading={saving} className="px-12 py-4 shadow-xl shadow-brand-blue-primary/10 ml-auto">
                        Sync Preferences
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserPreferences;