package com.deepu.taskmanager.service;

import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import com.deepu.taskmanager.dto.LeaderboardResponse;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.deepu.taskmanager.repository.TaskRepository taskRepository;

    @Autowired
    private PerformanceService performanceService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // CREATE USER
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // GET ALL USERS
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET USER BY ID
    public User getUserById(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(null);
    }

    // UPDATE USER
    public User updateUser(Long id, User user) {
        Optional<User> existingUser = userRepository.findById(id);

        if (existingUser.isPresent()) {
            User updatedUser = existingUser.get();
            updatedUser.setName(user.getName());
            updatedUser.setEmail(user.getEmail());
            
            // Only update password if a new one is provided
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                updatedUser.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            
            updatedUser.setRole(user.getRole());

            return userRepository.save(updatedUser);
        }

        return null;
    }

    // DELETE USER
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // GET LEADERBOARD
    public List<LeaderboardResponse> getLeaderboard() {
        List<User> users = userRepository.findAll().stream()
                .sorted((u1, u2) -> Integer.compare(u2.getPerformanceScore(), u1.getPerformanceScore()))
                .collect(Collectors.toList());

        return IntStream.range(0, users.size())
                .mapToObj(i -> {
                    User u = users.get(i);
                    int score = (u.getPerformanceScore() != null) ? u.getPerformanceScore() : 0;
                    
                    // Task Stats
                    long total = taskRepository.countByAssignedTo(u);
                    long completed = taskRepository.countByAssignedToAndStatus(u, com.deepu.taskmanager.entity.TaskStatus.DONE);
                    long overdue = taskRepository.findByAssignedToOrderByCreatedAtDesc(u).stream()
                            .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(java.time.LocalDateTime.now()) && t.getStatus() != com.deepu.taskmanager.entity.TaskStatus.DONE)
                            .count();

                    // Streak Stats
                    int currentStr = u.getCurrentStreak();
                    int longestStr = u.getLongestStreak();

                    // Points to Next Rank logic
                    int pointsToNext = 0;
                    if (i > 0) {
                        pointsToNext = users.get(i - 1).getPerformanceScore() - score + 1;
                    }

                    // Badge Logic Override: Rank 1-3 are ALWAYS Top Performers
                    String badge;
                    if (i < 3) {
                        badge = "🏆 Top Performer";
                    } else {
                        badge = (performanceService != null) ? performanceService.getBadge(score) : "Contributor";
                    }
                    
                    // Score Explanation
                    String explanation = String.format("Score from %d tasks", completed);
                    if (score > (completed * 10)) {
                        explanation += " (+ Bonuses)";
                    } else if (score < (completed * 10)) {
                        explanation += " (- Penalties)";
                    }
                    explanation = String.format("%d pts from %d tasks", score, completed);
                    
                    // Smart Feedback logic
                    boolean hasEarly = taskRepository.findByAssignedToOrderByCreatedAtDesc(u).stream()
                            .anyMatch(t -> t.getCompletedAt() != null && t.getDueDate() != null && t.getCompletedAt().isBefore(t.getDueDate()));
                    
                    String feedback;
                    if (pointsToNext > 0 && pointsToNext < 20) {
                        feedback = String.format("Complete 1-2 more tasks to reach Rank #%d!", i);
                    } else {
                        feedback = (performanceService != null) ? performanceService.getFeedback(overdue, completed, hasEarly) : "Keep up the good work!";
                    }

                    boolean promo = (performanceService != null) && performanceService.isPromotionReady(score);
                    
                    return new LeaderboardResponse(
                        i + 1,
                        u.getName(),
                        score,
                        badge,
                        feedback,
                        promo,
                        total,
                        completed,
                        overdue,
                        currentStr,
                        longestStr,
                        pointsToNext,
                        explanation
                    );
                })
                .collect(Collectors.toList());
    }

    // GET USER PERFORMANCE PROFILE
    public LeaderboardResponse getUserPerformance(String email) {
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<LeaderboardResponse> board = getLeaderboard();
        return board.stream()
                .filter(l -> l.getName().equals(u.getName()))
                .findFirst()
                .orElse(null);
    }
}