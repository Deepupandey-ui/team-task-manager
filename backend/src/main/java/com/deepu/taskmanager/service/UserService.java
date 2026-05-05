package com.deepu.taskmanager.service;

import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.entity.Company;
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
    private com.deepu.taskmanager.repository.CompanyRepository companyRepository;

    @Autowired
    private PerformanceService performanceService;


    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // CREATE USER
    public User createUser(User user) {
        // 1. Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email '" + user.getEmail() + "' is already registered.");
        }

        // 2. Inherit company from the logged-in Admin
        String loggedInEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("Admin context not found"));
        
        user.setCompany(admin.getCompany());

        // 3. Initialize scores
        user.setPerformanceScore(0);
        user.setStreak(0);
        user.setLongestStreak(0);
        
        // 4. Encode password
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(user);
    }



    // GET ALL USERS (Company Scoped)
    public List<User> getAllUsers() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .map(u -> userRepository.findByCompany(u.getCompany()))
                .orElse(List.of());
    }


    // GET USER BY ID
    public User getUserById(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(null);
    }

    // UPDATE USER
    public User updateUser(Long id, User user) {
        String loggedInEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(loggedInEmail).orElseThrow(() -> new RuntimeException("User not found"));
        
        Optional<User> existingUser = userRepository.findById(id);

        if (existingUser.isPresent()) {
            User updatedUser = existingUser.get();
            
            // Security Check: Only allow if same company
            if (currentUser.getCompany() != null && !currentUser.getCompany().equals(updatedUser.getCompany())) {
                throw new RuntimeException("Permission Denied: User belongs to a different company");
            }

            updatedUser.setName(user.getName());
            updatedUser.setEmail(user.getEmail());
            
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
        String loggedInEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(loggedInEmail).orElseThrow(() -> new RuntimeException("User not found"));
        
        User target = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Security Check: Only allow if same company
        if (currentUser.getCompany() != null && !currentUser.getCompany().equals(target.getCompany())) {
            throw new RuntimeException("Permission Denied: User belongs to a different company");
        }
        
        userRepository.deleteById(id);
    }


    // GET LEADERBOARD
    public List<LeaderboardResponse> getLeaderboard() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Company company = currentUser.getCompany();

        if (company == null) return List.of();

        List<User> companyUsers = userRepository.findByCompany(company);
        
        // Calculate scores for all users first to ensure correct sorting
        List<LeaderboardResponse> board = companyUsers.stream()
                .map(u -> {
                    List<com.deepu.taskmanager.entity.Task> userTasks = taskRepository.findByAssignedToOrderByCreatedAtDesc(u);
                    int score = performanceService.calculateTotalScore(u, userTasks);
                    
                    long total = userTasks.size();
                    long completed = userTasks.stream().filter(t -> t.getStatus() == com.deepu.taskmanager.entity.TaskStatus.DONE).count();
                    long overdue = userTasks.stream()
                            .filter(t -> t.getStatus() != com.deepu.taskmanager.entity.TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(java.time.LocalDateTime.now()))
                            .count();
                    String companyName = u.getCompany() != null ? u.getCompany().getName() : "Default Company";
                    return new LeaderboardResponse(0, u.getName(), score, "", "", false, total, completed, overdue, u.getStreak(), u.getLongestStreak(), 0, "", companyName);
                })

                .sorted((r1, r2) -> Integer.compare(r2.getScore(), r1.getScore()))
                .collect(Collectors.toList());

        // Assign ranks and badges/goals
        return IntStream.range(0, board.size())
                .mapToObj(i -> {
                    LeaderboardResponse resp = board.get(i);
                    int score = resp.getScore();
                    int rank = i + 1;
                    
                    String badge = performanceService.getBadge(score, rank);
                    
                    int nextRankScore = (i > 0) ? board.get(i - 1).getScore() : score;
                    String feedback = performanceService.getGoalMessage(score, rank, nextRankScore);
                    
                    String explanation = String.format("%d pts from %d tasks", score, resp.getCompletedTasks());
                    
                    return new LeaderboardResponse(
                        rank,
                        resp.getName(),
                        score,
                        badge,
                        feedback,
                        score >= 60, // Promotion ready at Top Performer level
                        resp.getTotalTasks(),
                        resp.getCompletedTasks(),
                        resp.getOverdueTasks(),
                        resp.getStreak(),
                        resp.getLongestStreak(),
                        (i > 0) ? nextRankScore - score : 0,
                        explanation,
                        resp.getCompanyName()
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