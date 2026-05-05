package com.deepu.taskmanager.controller;

import com.deepu.taskmanager.dto.LeaderboardResponse;
import com.deepu.taskmanager.entity.Company;
import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.repository.UserRepository;
import com.deepu.taskmanager.service.UserService;
import com.deepu.taskmanager.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getCompanyStats() {
        User currentUser = getCurrentUser();
        Company company = currentUser.getCompany();

        if (company == null) {
            return ResponseEntity.badRequest().body("User not associated with a company");
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.countByCompany(company));
        
        var taskStats = taskService.getStats();
        stats.put("taskStats", taskStats);

        // Calculate percentages
        if (taskStats.getTotalTasks() > 0) {
            stats.put("completedPct", (double) taskStats.getDoneCount() / taskStats.getTotalTasks() * 100);
            // Approximate overdue % from task list or specific query
        }

        // Top 3, Lowest 3 & Full List for searching
        List<LeaderboardResponse> leaderboard = userService.getLeaderboard();
        stats.put("topPerformers", leaderboard.stream().limit(3).collect(Collectors.toList()));
        stats.put("lowestPerformers", leaderboard.stream().sorted((a, b) -> Integer.compare(a.getScore(), b.getScore())).limit(3).collect(Collectors.toList()));
        stats.put("fullLeaderboard", leaderboard);

        return ResponseEntity.ok(stats);
    }
}

