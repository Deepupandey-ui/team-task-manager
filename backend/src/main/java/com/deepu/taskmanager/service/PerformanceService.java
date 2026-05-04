package com.deepu.taskmanager.service;

import com.deepu.taskmanager.entity.Task;
import com.deepu.taskmanager.entity.TaskStatus;
import com.deepu.taskmanager.entity.User;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class PerformanceService {

    public int calculateScoreChange(Task task) {
        int baseScore = 10;
        int bonus = 0;
        int penalty = 0;

        // Difficulty Multiplier
        int multiplier = 1;
        String difficulty = task.getDifficulty() != null ? task.getDifficulty() : "MEDIUM";
        if (difficulty.equalsIgnoreCase("HARD")) multiplier = 3;
        else if (difficulty.equalsIgnoreCase("MEDIUM")) multiplier = 2;

        if (task.getStatus() != TaskStatus.DONE) {
            // Check if currently overdue
            if (task.getDueDate() != null && task.getDueDate().isBefore(LocalDateTime.now())) {
                return -7; // Overdue penalty
            }
            return 0;
        }

        // Task is DONE
        LocalDateTime completed = task.getCompletedAt();
        LocalDateTime due = task.getDueDate();

        if (completed == null || due == null) {
            return baseScore * multiplier;
        }

        if (completed.isBefore(due)) {
            bonus = 5; // Early completion bonus
        } else if (completed.isAfter(due)) {
            penalty = 7; // Late completion penalty
            return -penalty; // Overdue task gets negative points
        }

        return (baseScore + bonus) * multiplier;
    }

    public int updateStreakAndGetBonus(User user) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last = user.getLastTaskDate();
        
        if (last == null) {
            user.setCurrentStreak(1);
            user.setLastTaskDate(now);
            return 0;
        }

        long daysBetween = ChronoUnit.DAYS.between(last.toLocalDate(), now.toLocalDate());

        if (daysBetween == 0) {
            // Already completed a task today, streak continues but no increment needed for today
            return 0;
        } else if (daysBetween == 1) {
            // Consecutive day
            user.setCurrentStreak(user.getCurrentStreak() + 1);
            if (user.getCurrentStreak() > user.getLongestStreak()) {
                user.setLongestStreak(user.getCurrentStreak());
            }
            user.setLastTaskDate(now);

            // Bonus logic
            if (user.getCurrentStreak() == 3) return 10;
            if (user.getCurrentStreak() == 7) return 25;
            if (user.getCurrentStreak() == 15) return 50;
            return 0;
        } else {
            // Streak broken
            user.setCurrentStreak(1);
            user.setLastTaskDate(now);
            return 0;
        }
    }

    public String getBadge(int score) {
        if (score >= 80) return "💎 Elite Performer";
        if (score >= 40) return "🌟 Rising Star";
        if (score >= 10) return "🛡️ Active Contributor";
        return "⚠️ Needs Improvement";
    }

    public String getFeedback(long overdueCount, long completedCount, boolean hasEarlyCompletions) {
        if (overdueCount > 2) return "⚠️ You have overdue tasks. Improve time management.";
        if (hasEarlyCompletions && completedCount > 3) return "🚀 Excellent speed! You're ahead of deadlines.";
        if (completedCount > 5) return "🔥 Great work! Keep the momentum.";
        return "💡 Consistency is key. Focus on daily task completion.";
    }

    public boolean isPromotionReady(int score) {
        return score >= 100;
    }
}
