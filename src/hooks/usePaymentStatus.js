import { useState, useEffect } from 'react';
import api from '../services/api';

export const usePaymentStatus = (propertyId) => {
    const [status, setStatus] = useState({
        isPaid: false,
        paidBy: null,
        amount: null,
        paidAt: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trigger, setTrigger] = useState(0);
    const refetch = () => setTrigger(t => t + 1);

    useEffect(() => {
        if (!propertyId) return;

        const fetchStatus = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/payments/status/${propertyId}/`);
                const data = response.data;
                setStatus({
                    isPaid: data.is_paid,
                    paidBy: data.paid_by,
                    amount: data.amount,
                    paidAt: data.paid_at
                });
                setError(null);
            } catch (err) {
                console.error('Failed to fetch payment status:', err);
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [propertyId, trigger]);

    return { ...status, loading, error, refetch };
};
