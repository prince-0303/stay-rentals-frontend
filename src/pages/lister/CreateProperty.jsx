import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../../components/lister/PropertyForm';
import Footer from '../../components/common/Footer';
import { propertyService } from '../../services/propertyService';

const CreateProperty = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState(null);

    const handleSubmit = async (formData, newImages, deletedImages) => {
        setLoading(true);
        setGlobalError(null);

        console.log('Submitting formData:', JSON.stringify(formData, null, 2));
        try {
            const response = await propertyService.createProperty(formData);
            const newPropertyId = response.id;

            if (newImages && newImages.length > 0) {
                const imgFormData = new FormData();
                newImages.forEach(file => imgFormData.append('images', file));
                imgFormData.append('primary_index', 0);
                await propertyService.uploadPropertyImages(newPropertyId, imgFormData);
            }

            navigate('/my-listings');
        } catch (error) {
            let errorMessage = "Failed to create listing. Please check the details.";
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    errorMessage = error.response.data.detail || Object.entries(error.response.data)
                        .map(([field, msgs]) => `${field.toUpperCase()}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join(' | ');
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }
            setGlobalError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-offwhite text-brand-gray-dark">

            <main className="max-w-5xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                <div className="mb-12">
                    <button
                        onClick={() => navigate('/my-listings')}
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray-light hover:text-brand-blue-primary transition-colors flex items-center gap-3 mb-6"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Portfolio Return
                    </button>
                    <h1 className="text-5xl font-black tracking-tighter mb-2">Host New Asset</h1>
                    <p className="text-lg font-bold text-brand-blue-primary uppercase tracking-tighter">Initialize a new premium space on the grid</p>
                </div>

                {globalError && (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] flex items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-4">
                        <div className="w-1.5 h-10 bg-red-500 rounded-full" />
                        <p className="text-xs font-black text-red-800 uppercase tracking-tight">{globalError}</p>
                    </div>
                )}

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <PropertyForm
                        onSubmit={handleSubmit}
                        loading={loading}
                        onCancel={() => navigate('/my-listings')}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CreateProperty;
