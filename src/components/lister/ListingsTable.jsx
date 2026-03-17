import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';

const ListingsTable = ({ properties = [] }) => {
    const navigate = useNavigate();

    const defaultProperties = [
        { id: 1, title: "The Onyx Penthouse", status: "Active", price: "₹85,000", location: "Andheri West, Mumbai" },
        { id: 2, title: "Azure Waterfront Villa", status: "Review", price: "₹1,20,000", location: "Bandra, Mumbai" },
    ];

    const displayProperties = properties.length > 0 ? properties : defaultProperties;

    return (
        <div className="bg-white border-2 border-brand-gray-light rounded-[48px] overflow-hidden shadow-sm">
            <div className="px-12 py-10 border-b border-brand-gray-light flex justify-between items-center bg-brand-offwhite/50">
                <div>
                    <h3 className="text-2xl font-black tracking-tighter">Live Portfolio</h3>
                    <p className="text-[10px] font-black text-brand-gray-medium uppercase tracking-widest mt-1">Synchronized Ez-Stay Assets</p>
                </div>
                <Button
                    variant="primary"
                    className="px-10 py-4 shadow-xl shadow-brand-blue-primary/10"
                    onClick={() => navigate('/my-listings/create')}
                >
                    + Host Asset
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-brand-offwhite/30">
                            <th className="px-12 py-6 font-black text-[10px] text-brand-gray-medium uppercase tracking-[0.2em] border-b border-brand-gray-light">Asset Configuration</th>
                            <th className="px-12 py-6 font-black text-[10px] text-brand-gray-medium uppercase tracking-[0.2em] border-b border-brand-gray-light">Grid Status</th>
                            <th className="px-12 py-6 font-black text-[10px] text-brand-gray-medium uppercase tracking-[0.2em] border-b border-brand-gray-light">Valuation</th>
                            <th className="px-12 py-6 font-black text-[10px] text-brand-gray-medium uppercase tracking-[0.2em] border-b border-brand-gray-light text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray-light">
                        {displayProperties.map((item, idx) => (
                            <tr key={idx} className="hover:bg-brand-offwhite/30 transition-all duration-300 group">
                                <td className="px-12 py-8">
                                    <p className="font-black text-brand-gray-dark text-lg tracking-tight mb-1">{item.title}</p>
                                    <p className="text-xs font-bold text-brand-gray-medium group-hover:text-brand-blue-primary transition-colors">{item.location}</p>
                                </td>
                                <td className="px-12 py-8">
                                    <Badge
                                        variant={item.status === 'Active' ? 'primary' : 'neutral'}
                                        className={`font-black uppercase tracking-widest text-[8px] py-1.5 px-3 border-none ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-offwhite text-brand-gray-dark'
                                            }`}
                                    >
                                        {item.status}
                                    </Badge>
                                </td>
                                <td className="px-12 py-8 font-black text-brand-gray-dark text-lg">{item.price}<span className="text-[10px] text-brand-gray-light ml-1">/MO</span></td>
                                <td className="px-12 py-8 text-right">
                                    <div className="flex justify-end gap-6">
                                        <button
                                            onClick={() => navigate(`/my-listings/edit/${item.id}`)}
                                            className="text-[10px] font-black uppercase tracking-widest text-brand-blue-primary hover:text-brand-blue-dark transition-all hover:scale-110"
                                        >
                                            Configure
                                        </button>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-all hover:scale-110">
                                            De-list
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {displayProperties.length === 0 && (
                <div className="p-20 text-center">
                    <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-[0.3em]">No assets currently indexed on the grid.</p>
                </div>
            )}
        </div>
    );
};

export default ListingsTable;
