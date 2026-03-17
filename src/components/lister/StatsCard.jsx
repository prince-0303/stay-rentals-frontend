import React from 'react';
import Badge from '../common/Badge';

const StatsCard = ({ stats = [] }) => {
    const defaultStats = [
        { label: 'Total Inquiries', value: '42', change: '+18.5%', color: 'from-brand-blue-primary to-brand-blue-dark' },
        { label: 'Active Properties', value: '05', change: 'Steady', color: 'from-brand-accent to-yellow-600' },
        { label: 'Weekly Reach', value: '2.8k', change: '+5.2%', color: 'from-brand-gray-dark to-brand-gray-light' }
    ];

    const displayStats = stats.length > 0 ? stats : defaultStats;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayStats.map((stat, idx) => (
                <div key={idx} className="bg-white border border-brand-gray-light p-10 rounded-[40px] relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${stat.color} opacity-5 rounded-bl-[100px] transition-transform duration-1000 group-hover:scale-125`} />

                    <p className="text-[10px] font-black text-brand-gray-medium uppercase tracking-[0.3em] mb-6 pl-1">{stat.label}</p>

                    <div className="flex items-end justify-between relative z-10">
                        <h3 className="text-5xl font-black text-brand-gray-dark tracking-tighter leading-none">{stat.value}</h3>
                        <Badge
                            variant={stat.change.includes('+') ? 'primary' : 'neutral'}
                            className={`border-none py-2 px-4 rounded-2xl text-[10px] font-black tracking-tight ${stat.change.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-offwhite text-brand-gray-dark'
                                }`}
                        >
                            {stat.change}
                        </Badge>
                    </div>

                    <div className="mt-8 h-1 w-full bg-brand-offwhite rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${stat.color} w-3/4 rounded-full`} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCard;
