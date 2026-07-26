import React from 'react';

export default function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="min-w-0 pr-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1 truncate">
          {value !== undefined && value !== null ? value.toLocaleString() : 0}
        </h3>
      </div>
      <div className={`p-3 rounded-xl shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}