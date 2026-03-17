import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropertyForm from '../../components/lister/PropertyForm';
import Footer from '../../components/common/Footer';
import { propertyService } from '../../services/propertyService';

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [propertyData, setPropertyData] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [globalError, setGlobalError] = useState(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setPageLoading(true);
                const data = await propertyService.getProperty(id);
                setPropertyData(data);
            } catch (error) {
                setGlobalError("Asset retrieval failure. The property may have been de-listed or access is restricted.");
            } finally {
                setPageLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    const handleSubmit = async (formData, newImages, deletedImages) => {
        setSubmitLoading(true);
        setGlobalError(null);

        try {
            if (deletedImages && deletedImages.length > 0) {
                await Promise.all(deletedImages.map(imgId => propertyService.deletePropertyImage(id, imgId)));
            }

            await propertyService.updateProperty(id, formData);

            if (newImages && newImages.length > 0) {
                const imgFormData = new FormData();
                newImages.forEach(file => imgFormData.append('images', file));
                await propertyService.uploadPropertyImages(id, imgFormData);
            }

            navigate('/my-listings');
        } catch (error) {
            setGlobalError(error.response?.data?.detail || "Failed to save changes. Please try again.");
        } finally {
            setSubmitLoading(false);
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
                    <h1 className="text-5xl font-black tracking-tighter mb-2">Modify Asset</h1>
                    <p className="text-lg font-bold text-brand-blue-primary uppercase tracking-tighter">Update parameter configurations for your premium space</p>
                </div>

                {globalError && (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] flex items-center gap-6 mb-12">
                        <div className="w-1.5 h-10 bg-red-500 rounded-full" />
                        <p className="text-xs font-black text-red-800 uppercase tracking-tight">{globalError}</p>
                    </div>
                )}

                {pageLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="w-12 h-12 border-4 border-brand-blue-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-gray-light">Retrieving Grid Data...</p>
                    </div>
                ) : propertyData ? (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <PropertyForm
                            initialData={propertyData}
                            onSubmit={handleSubmit}
                            loading={submitLoading}
                            onCancel={() => navigate('/my-listings')}
                        />
                    </div>
                ) : (
                    <div className="bg-white p-16 rounded-[48px] border border-brand-gray-light text-center shadow-sm">
                        <div className="w-20 h-20 bg-brand-offwhite rounded-[32px] flex items-center justify-center mx-auto mb-8 text-brand-gray-light">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-3xl font-black text-brand-gray-dark tracking-tighter mb-4">Asset Unavailable</h3>
                        <p className="text-brand-gray-medium font-bold mb-10 max-w-[384px] mx-auto">The requested premium asset could not be located on the primary grid.</p>
                        <Button variant="primary" onClick={() => navigate('/my-listings')} className="px-10 py-4">Return to Portfolio</Button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default EditProperty;
