import React from "react";
import "./AnalyticsDashboard.css";

function AnalyticsDashboard({ stats }) {
  if (!stats) return null;

  const { totalTasks, todoCount, inProgressCount, doneCount } = stats;

  // Calculate percentages for the visual ring
  const todoPct = totalTasks > 0 ? (todoCount / totalTasks) * 100 : 0;
  const progressPct = totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0;
  const donePct = totalTasks > 0 ? (doneCount / totalTasks) * 100 : 100;

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <h3>Analytics Overview</h3>
        <span className="total-badge">{totalTasks} Total Tasks</span>
      </div>

      <div className="analytics-grid">
        {/* Visual Chart - Custom CSS Donut */}
        <div className="analytics-chart-container">
          <div className="donut-chart" style={{
            background: `conic-gradient(
              #3b5bdb 0% ${todoPct}%, 
              #fab005 ${todoPct}% ${todoPct + progressPct}%, 
              #40c057 ${todoPct + progressPct}% 100%
            )`
          }}>
            <div className="donut-hole">
              <span className="donut-number">{totalTasks}</span>
              <span className="donut-label">Tasks</span>
            </div>
          </div>
          
          <div className="chart-legend">
            <div className="legend-item"><span className="dot todo"></span> To Do ({todoCount})</div>
            <div className="legend-item"><span className="dot progress"></span> In Progress ({inProgressCount})</div>
            <div className="legend-item"><span className="dot done"></span> Done ({doneCount})</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards-vertical">
          <div className="mini-stat-card">
            <div className="mini-stat-icon todo-icon">📋</div>
            <div className="mini-stat-info">
              <span className="mini-stat-val">{todoCount}</span>
              <span className="mini-stat-lab">To Do</span>
            </div>
            <div className="mini-stat-progress"><div className="bar todo-bar" style={{width: `${todoPct}%`}}></div></div>
          </div>

          <div className="mini-stat-card">
            <div className="mini-stat-icon progress-icon">⚡</div>
            <div className="mini-stat-info">
              <span className="mini-stat-val">{inProgressCount}</span>
              <span className="mini-stat-lab">In Progress</span>
            </div>
            <div className="mini-stat-progress"><div className="bar progress-bar" style={{width: `${progressPct}%`}}></div></div>
          </div>

          <div className="mini-stat-card">
            <div className="mini-stat-icon done-icon">✅</div>
            <div className="mini-stat-info">
              <span className="mini-stat-val">{Math.round(donePct)}%</span>
              <span className="mini-stat-lab">Completion Rate</span>
            </div>
            <div className="mini-stat-progress"><div className="bar done-bar" style={{width: `${donePct}%`}}></div></div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
