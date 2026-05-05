package com.deepu.taskmanager.service;

import com.deepu.taskmanager.entity.Task;
import com.deepu.taskmanager.entity.TaskStatus;
import com.deepu.taskmanager.entity.User;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class PerformanceService {

    /**
     * Step 2: Calculate Score based on formula:
     * score = (completedTasks * 10) + (earlyCompletedTasks * 5) - (overdueTasks * 7) + (streak * 3)
     */
    public int calculateTotalScore(User user, List<Task> tasks) {
        long completedBeforeDeadline = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE && t.getCompletedAt() != null && t.getDueDate() != null && t.getCompletedAt().isBefore(t.getDueDate()))
                .count();
        long completedAfterDeadline = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE && (t.getCompletedAt() == null || t.getDueDate() == null || t.getCompletedAt().isAfter(t.getDueDate())))
                .count();
        long overdueTasks = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(LocalDateTime.now()))
                .count();
        int streak = user.getStreak() != null ? user.getStreak() : 0;

        return (int) ((completedBeforeDeadline * 10) + (completedAfterDeadline * 5) - (overdueTasks * 5) + (streak * 2));
    }


    /**
     * Step 3: Badge System
     */
    public String getBadge(int score, int rank) {
        // Important: Top 3 rank override
        if (rank > 0 && rank <= 3) {
            return "Top Performer";
        }

        if (score < 10) return "Needs Improvement";
        if (score < 30) return "Consistent";
        if (score < 60) return "Performer";
        return "Top Performer";
    }

    /**
     * Step 4: Streak System
     * Logic: if user completes task today, check if last active was yesterday.
     */
    public void updateStreakOnTaskCompletion(User user) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastActive = user.getLastActiveDate();

        if (lastActive == null) {
            user.setStreak(1);
        } else {
            long daysSinceLastActive = ChronoUnit.DAYS.between(lastActive.toLocalDate(), now.toLocalDate());
            
            if (daysSinceLastActive == 1) {
                user.setStreak(user.getStreak() + 1);
            } else if (daysSinceLastActive > 1) {
                user.setStreak(1);
            }
            // If daysSinceLastActive == 0, streak stays same (already active today)
        }
        user.setLastActiveDate(now);
    }

    /**
     * Step 5: Goal Engine
     */
    public String getGoalMessage(int score, int rank, int nextRankScore) {
        if (rank > 1 && nextRankScore > score) {
            return "You need +" + (nextRankScore - score) + " points to reach Rank #" + (rank - 1);
        }
        
        // Badge goals
        if (score < 10) return "You need +" + (10 - score) + " points to reach Consistent badge";
        if (score < 30) return "You need +" + (30 - score) + " points to reach Performer badge";
        if (score < 60) return "You need +" + (60 - score) + " points to reach Top Performer badge";
        
        return "You are at the top of your game!";
    }

    /**
     * Step 6: Progress Bar (Completion Rate)
     */
    public double calculateCompletionRate(List<Task> tasks) {
        if (tasks.isEmpty()) return 0.0;
        long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        return (double) completed / tasks.size() * 100;
    }
}

