import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  bgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  description,
  bgColor = 'bg-white',
}) => {
  return (
    <div className={`p-5 rounded-2xl border border-[#e8e7f1] shadow-xs ${bgColor} transition-all`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#757684] uppercase tracking-wider">{title}</p>
        <div className="p-2.5 rounded-xl bg-[#f4f2fc] text-[#00288e]">{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-black text-[#1a1b22] tracking-tight">{value}</h3>
        {change && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              changeType === 'positive'
                ? 'bg-emerald-50 text-emerald-700'
                : changeType === 'negative'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {description && <p className="text-xs text-[#505f76] mt-2">{description}</p>}
    </div>
  );
};
