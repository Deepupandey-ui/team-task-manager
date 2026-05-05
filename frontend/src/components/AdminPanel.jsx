import React, { useState, useEffect } from "react";
import { getAdminStats } from "../services/api";
import "./AdminPanel.css";

function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await getAdminStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSearching = searchTerm.trim().length > 0;
  const filteredUsers = isSearching 
    ? stats?.fullLeaderboard.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  if (loading) return <div className="admin-loading">Loading Analytics...</div>;
  if (!stats) return <div className="admin-error">Failed to load stats.</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Company Insights</h1>
          <p>Real-time performance metrics for your organization</p>
        </div>
        <div className="admin-actions">
          <div className="admin-search-box">
             🔍 <input 
               type="text" 
               placeholder="Find any employee..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             {isSearching && <button className="clear-search" onClick={() => setSearchTerm("")}>✕</button>}
          </div>
          <button className="refresh-btn" onClick={loadStats}>🔄 Refresh</button>
        </div>
      </div>

      {isSearching ? (
        <div className="search-results-section anim-fade-in">
          <h2>🔍 Search Results ({filteredUsers.length})</h2>
          <div className="results-grid">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <div key={u.name} className="result-card">
                   <div className="result-rank">#{u.rank}</div>
                   <div className="result-info">
                      <div className="result-name">{u.name}</div>
                      <div className="result-badge">{u.badge}</div>
                   </div>
                   <div className="result-score">{u.score} pts</div>
                </div>
              ))
            ) : (
              <div className="no-results">No employees found matching "{searchTerm}"</div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="admin-grid">
            <div className="stat-card large">
              <h3>Total Employees</h3>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="stat-card large">
              <h3>Completion Rate</h3>
              <div className="stat-value">{Math.round(stats.completedPct || 0)}%</div>
              <div className="stat-bar">
                <div className="bar-fill" style={{ width: `${stats.completedPct}%` }}></div>
              </div>
            </div>
          </div>

          <div className="admin-sections">
            <div className="performer-section">
              <h3>🚀 Top 3 Performers</h3>
              <div className="performer-list">
                {stats.topPerformers.map((u, i) => (
                  <div key={u.name} className="performer-item">
                    <span className="rank">{i + 1}</span>
                    <span className="name">{u.name}</span>
                    <span className="score">{u.score} pts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="performer-section">
              <h3>⚠️ Needs Support (Lowest 3)</h3>
              <div className="performer-list">
                {stats.lowestPerformers.map((u, i) => (
                  <div key={u.name} className="performer-item warning">
                    <span className="rank">{i + 1}</span>
                    <span className="name">{u.name}</span>
                    <span className="score">{u.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

}

export default AdminPanel;
