import React from 'react';

const LeadGraph = ({ leads = [], onUpdate }) => {
    const formattedLeads = leads.map(lead => {
        const name = lead.user_name || lead.tenant_name || lead.user?.first_name || 'Guest User';
        return {
            id: lead.id,
            name: name,
            msg: lead.user_note || `New visit request for ${lead.property_title || lead.property?.title || 'a property'}.`,
            time: new Date(lead.created_at || lead.requested_date).toLocaleDateString(),
            initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            original: lead
        };
    });

    const displayLeads = formattedLeads;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black tracking-tighter">Inquiry Feed</h3>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-blue-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue-primary">Live Updates</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {displayLeads.length > 0 ? displayLeads.map((lead) => (
                    <div key={lead.id} className="bg-white border border-brand-gray-light p-8 rounded-[40px] flex items-center justify-between hover:border-brand-blue-primary hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-16 h-16 rounded-[24px] bg-brand-offwhite border border-brand-gray-light flex items-center justify-center font-black text-brand-blue-primary text-sm shadow-sm group-hover:bg-brand-blue-primary group-hover:text-white transition-all duration-500">
                                {lead.initials || lead.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h4 className="font-black text-brand-gray-dark text-xl group-hover:text-brand-blue-primary transition-colors tracking-tight">{lead.name}</h4>
                                <p className="text-sm font-medium text-brand-gray-medium line-clamp-1 max-w-[448px] mt-1 italic">"{lead.msg}"</p>
                            </div>
                        </div>

                        <div className="text-right shrink-0">
                            <p className="text-[10px] font-black text-brand-gray-light uppercase tracking-[0.2em] mb-3">{lead.time}</p>
                            {lead.original?.status !== 'cancelled' && lead.original?.status !== 'completed' ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUpdate && onUpdate(lead.id, lead.original?.property?.id || lead.original?.property_id, 'cancelled'); }}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Cancel
                                </button>
                            ) : (
                                <span className="bg-brand-offwhite text-brand-gray-medium px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                    {lead.original?.status || 'Archived'}
                                </span>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="bg-white border border-brand-gray-light p-8 rounded-[40px] text-center">
                        <p className="text-sm font-black text-brand-gray-medium">No inquiries received yet.</p>
                    </div>
                )}
            </div>

            <button className="w-full py-6 rounded-[32px] border-2 border-dashed border-brand-gray-light text-[10px] font-black uppercase tracking-widest text-brand-gray-light hover:border-brand-blue-primary hover:text-brand-blue-primary transition-all mt-6">
                Expand Communication History
            </button>
        </div>
    );
};

export default LeadGraph;
