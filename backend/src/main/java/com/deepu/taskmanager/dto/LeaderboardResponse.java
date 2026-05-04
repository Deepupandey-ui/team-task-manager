package com.deepu.taskmanager.dto;

public class LeaderboardResponse {
    private int rank;
    private String name;
    private int score;
    private String badge;
    private String feedback;
    private boolean promotionReady;
    
    // New stats fields
    private long totalTasks;
    private long completedTasks;
    private long overdueTasks;
    private int currentStreak;
    private int longestStreak;
    private int pointsToNextRank;
    private String scoreExplanation;

    public LeaderboardResponse(int rank, String name, int score, String badge, String feedback, boolean promotionReady, 
                               long totalTasks, long completedTasks, long overdueTasks, int currentStreak, int longestStreak, int pointsToNextRank, String scoreExplanation) {
        this.rank = rank;
        this.name = name;
        this.score = score;
        this.badge = badge;
        this.feedback = feedback;
        this.promotionReady = promotionReady;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.overdueTasks = overdueTasks;
        this.currentStreak = currentStreak;
        this.longestStreak = longestStreak;
        this.pointsToNextRank = pointsToNextRank;
        this.scoreExplanation = scoreExplanation;
    }

    // Getters
    public int getRank() { return rank; }
    public String getName() { return name; }
    public int getScore() { return score; }
    public String getBadge() { return badge; }
    public String getFeedback() { return feedback; }
    public boolean isPromotionReady() { return promotionReady; }
    public long getTotalTasks() { return totalTasks; }
    public long getCompletedTasks() { return completedTasks; }
    public long getOverdueTasks() { return overdueTasks; }
    public int getCurrentStreak() { return currentStreak; }
    public int getLongestStreak() { return longestStreak; }
    public int getPointsToNextRank() { return pointsToNextRank; }
    public String getScoreExplanation() { return scoreExplanation; }
}
