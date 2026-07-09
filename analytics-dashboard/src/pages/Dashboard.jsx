import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Activity,
  Layers,
  Database,
} from "lucide-react";

import StatCard from "../components/StatCard";
import AnalyticsChart from "../components/AnalyticsChart";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [source, setSource] = useState("fetching...");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5002/api/v1/reports/recent"
      );

      const json = await response.json();

      if (json.success) {
        setEvents(json.data);
        setSource(json.source);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalEvents = events.length;
  const uniqueUsers = new Set(events.map((e) => e.userId)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Analytics Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Real-time metrics from Distributed Microservices Pipeline
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold shadow-sm ${
            source === "cache"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {source === "cache" ? (
            <Layers className="w-4 h-4 animate-pulse" />
          ) : (
            <Database className="w-4 h-4" />
          )}

          Data Source: {source.toUpperCase()}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Event Logs"
            value={totalEvents}
            icon={Activity}
            color="bg-indigo-600"
          />

          <StatCard
            title="Unique Users"
            value={uniqueUsers}
            icon={Users}
            color="bg-sky-500"
          />

          <StatCard
            title="Throughput (window)"
            value={`${totalEvents} / 50`}
            icon={BarChart3}
            color="bg-violet-500"
          />
        </div>

        {/* Chart + Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnalyticsChart data={events} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Live Event Stream
            </h3>

            <div className="overflow-y-auto flex-1 space-y-3 pr-2 scrollbar-thin">
              {events.slice(0, 10).map((event, idx) => (
                <div
                  key={event._index || idx}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs flex justify-between items-start"
                >
                  <div>
                    <span className="font-bold text-indigo-600 uppercase">
                      {event.eventType}
                    </span>

                    <p className="text-gray-500 mt-0.5">
                      User: {event.userId}
                    </p>
                  </div>

                  <span className="text-gray-400 text-[10px]">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}