import React from "react";
import "./ActivityFeed.css";

function ActivityFeed({ activities }) {
  const getActionIcon = (action) => {
    switch (action) {
      case "CREATE": return "📝";
      case "UPDATE": return "✏️";
      case "DELETE": return "🗑️";
      case "MOVE": return "🚚";
      default: return "🔔";
    }
  };

  const getActionClass = (action) => {
    return `act-icon act-${action.toLowerCase()}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="activity-feed">
      <div className="activity-header">
        <h3>Recent Activity</h3>
      </div>
      <div className="activity-list">
        {activities.length === 0 ? (
          <p className="no-activity">No recent activities</p>
        ) : (
          activities.slice(0, 5).map((act) => (
            <div key={act.id} className="activity-item">
              <div className={getActionClass(act.action)}>
                {getActionIcon(act.action)}
              </div>
              <div className="activity-content">
                <p>
                  <strong>{act.userName}</strong> 
                  <span className="act-verb"> {act.action.toLowerCase()}d </span> 
                  <span className="act-task">"{act.taskTitle}"</span>
                </p>
                <span className="activity-time">{formatTime(act.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
