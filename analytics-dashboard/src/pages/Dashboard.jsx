import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3,
  Users,
  Activity,
  UserPlus,
  Layers,
  Database,
  Clipboard,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatCard from "../components/StatCard";
import AnalyticsChart from "../components/AnalyticsChart";

export default function Dashboard() {
  const [reportData, setReportData] = useState(null);
  const [source, setSource] = useState("fetching...");
  const [loading, setLoading] = useState(true);

  // Date range filters (Default: past 7 days)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  // API Key state
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      // Axios GET Request with query params
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:5004/api/v1/reports", {
      params: {
        startDate,
        endDate,
      },
      headers: {
        // Headers me Authorization token pass karo
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

      // Axios automatically parses JSON response into response.data
      const json = response.data;

      if (json.success) {
        setReportData(json.data);
        setSource(json.source || "DB");
      }
    } catch (error) {
      console.error(
        "Error fetching analytics report:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const key = localStorage.getItem("apiKey");
    if (key) {
      setApiKey(key);
    }

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const handleCopy = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("apiKey");
    navigate("/");
  };

  if (loading && !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const summary = reportData?.summary || {};
  const charts = reportData?.charts || {};
  const recentEvents = reportData?.recentEvents || [];


  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time metrics from Distributed Microservices Pipeline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker Controls */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs shadow-sm">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-gray-600 focus:outline-none"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-gray-600 focus:outline-none"
            />
          </div>

          {/* Compact API Key Widget */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm text-xs">
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono text-gray-600 max-w-[120px] truncate">
              {apiKey
                ? showKey
                  ? apiKey
                  : "••••••••••••"
                : "No Key"}
            </span>
            {apiKey && (
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-gray-400 hover:text-gray-600 p-0.5"
                title={showKey ? "Hide" : "Show"}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={!apiKey}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-1 rounded-md transition"
              title="Copy API Key"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
            </button>
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

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm transition font-medium shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stat Cards mapped with Summary Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Events (All Time)"
            value={summary.totalEvents || 0}
            icon={Activity}
            color="bg-indigo-600"
          />

          <StatCard
            title="Events Today"
            value={summary.eventsToday || 0}
            icon={BarChart3}
            color="bg-violet-500"
          />

          <StatCard
            title="Active Users Today"
            value={summary.usersToday || 0}
            icon={Users}
            color="bg-sky-500"
          />

          <StatCard
            title="New Users Today"
            value={summary.newUsersToday || 0}
            icon={UserPlus}
            color="bg-emerald-500"
          />
        </div>

        {/* Chart + Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Range data charts prop mapping */}
            <AnalyticsChart chartData={charts} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[450px] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Activity Feed
            </h3>

            <div className="overflow-y-auto flex-1 space-y-3 pr-2 scrollbar-thin">
              {recentEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">No recent events</p>
              ) : (
                recentEvents.slice(0, 15).map((event, idx) => (
                  <div
                    key={event._id || idx}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs flex justify-between items-start"
                  >
                    <div>
                      <span className="font-bold text-indigo-600 uppercase">
                        {event.eventType || event.name || "EVENT"}
                      </span>

                      <p className="text-gray-500 mt-0.5">
                        User: {event.userId || "N/A"}
                      </p>
                    </div>

                    <span className="text-gray-400 text-[10px]">
                      {event.createdAt
                        ? new Date(event.createdAt).toLocaleTimeString()
                        : "N/A"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}