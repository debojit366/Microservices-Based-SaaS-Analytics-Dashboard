import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function AnalyticsChart({ chartData }) {
  const [activeTab, setActiveTab] = useState('trend'); // 'trend' | 'distribution'

  // Safety fallback if chartData isn't loaded yet
  if (!chartData) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[450px] flex items-center justify-center text-gray-400">
        Loading chart data...
      </div>
    );
  }

  // 1. Time-series Trend Data formatting (labels, events, users, newUsers)
  const timeSeriesData = (chartData.labels || []).map((date, index) => ({
    date,
    TotalEvents: chartData.events?.[index] || 0,
    ActiveUsers: chartData.usersToday?.[index] || 0,
    NewUsers: chartData.newUsers?.[index] || 0,
  }));

  // 2. Event Distribution Data formatting ({ "LOGIN": 10, "CLICK": 25 })
  const distributionData = Object.entries(chartData.eventDistribution || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[450px] flex flex-col">
      {/* Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h3 className="text-lg font-semibold text-gray-800">Analytics Overview</h3>

        <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'trend'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Daily Trends
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'distribution'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Event Distribution
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'trend' ? (
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="TotalEvents"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="ActiveUsers"
                stroke="#0284c7"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="NewUsers"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          ) : (
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="value" name="Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}