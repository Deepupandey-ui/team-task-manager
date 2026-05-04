import React, { useState, useEffect } from "react";
import { getLeaderboard, getMyPerformance } from "../services/api";
import "./Leaderboard.css";

function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [myPerf, setMyPerf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lbRes, myRes] = await Promise.all([getLeaderboard(), getMyPerformance()]);
      setBoard(lbRes.data);
      setMyPerf(myRes.data);
    } catch (err) {
      console.error("Failed to load leaderboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  if (loading) return <div className="lb-loading">Analyzing Team Performance...</div>;

  const topThree = board.slice(0, 3);
  const others = board.slice(3);

  const renderProgressBar = (completed, total) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return (
      <div className="lb-progress-container">
        <div className="lb-progress-bar" style={{ width: `${percentage}%` }}></div>
        <span className="lb-progress-text">{percentage}%</span>
      </div>
    );
  };

  const filteredOthers = others.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.badge.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="leaderboard-container">
      {/* 1. Header & Personal Goal */}
      <div className="lb-hero">
        <div className="lb-hero-content">
          <h1>Company Leaderboard</h1>
          <p>Analyzing performance of {board.length} employees.</p>
          {myPerf && myPerf.pointsToNextRank > 0 && (
             <div className="lb-goal-box anim-pulse">
                🎯 <strong>Next Target:</strong> Reach Rank #{myPerf.rank - 1} with <span className="highlight">+{myPerf.pointsToNextRank}</span> points
             </div>
          )}
        </div>
        <div className="lb-hero-actions">
           <div className="lb-search-box">
             <input 
               type="text" 
               placeholder="Find employee..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="lb-refresh-btn" onClick={loadData}>🔄 Refresh Data</button>
        </div>
      </div>

      {/* 2. Podium Section */}
      <div className="lb-podium">
        {topThree.map((user) => (
          <div key={user.rank} className={`podium-card rank-${user.rank} anim-float`}>
            {user.rank === 1 && <div className="glow-effect"></div>}
            <div className="podium-badge">{getRankEmoji(user.rank)}</div>
            <div className="podium-avatar">{user.name.charAt(0)}</div>
            <h3 className="podium-name">{user.name}</h3>
            <span className="podium-badge-name">{user.badge}</span>
            <div className="podium-score">{user.score}</div>
            <div className="podium-explanation">{user.scoreExplanation}</div>
            <div className="podium-progress">
               <label>Task Velocity</label>
               {renderProgressBar(user.completedTasks, user.totalTasks)}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Others Table */}
      <div className="lb-table-wrapper">
        <table className="lb-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Employee</th>
              <th>Badge</th>
              <th>Progress</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredOthers.length > 0 ? (
              filteredOthers.map((user) => (
                <tr key={user.rank} className="table-row-hover">
                  <td className="rank-cell">#{user.rank}</td>
                  <td className="name-cell">
                    <strong>{user.name}</strong>
                    <span className="lb-feedback">{user.feedback}</span>
                  </td>
                  <td className="badge-cell">
                    <span className={`lb-badge badge-${user.badge.toLowerCase().replace(/\s+/g, '-')}`}>
                      {user.badge}
                    </span>
                  </td>
                  <td className="progress-cell">
                    {renderProgressBar(user.completedTasks, user.totalTasks)}
                  </td>
                  <td className="score-cell">
                    <span className="score-val">{user.score}</span>
                    <span className="score-hint">{user.scoreExplanation}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="lb-empty-state">
                  The competition is heating up! Keep moving.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;
