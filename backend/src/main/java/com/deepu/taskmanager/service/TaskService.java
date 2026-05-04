package com.deepu.taskmanager.service;

import com.deepu.taskmanager.dto.TaskRequest;
import com.deepu.taskmanager.dto.TaskResponse;
import com.deepu.taskmanager.dto.TaskStatsResponse;
import com.deepu.taskmanager.entity.Task;
import com.deepu.taskmanager.entity.TaskStatus;
import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.repository.TaskRepository;
import com.deepu.taskmanager.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final PerformanceService performanceService;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository, ActivityService activityService, PerformanceService performanceService) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
        this.performanceService = performanceService;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found in database"));
    }

    private String getCurrentRole() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("USER");
    }

    private User resolveAssignedUser(Long assignedToId, User currentUser) {
        if (assignedToId != null) {
            return userRepository.findById(assignedToId)
                    .orElseThrow(() -> new RuntimeException("Assigned user not found with id: " + assignedToId));
        }
        return currentUser;
    }

    public TaskResponse createTask(TaskRequest request) {
        User currentUser = getCurrentUser();

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setUser(currentUser);
        task.setDifficulty(request.getDifficulty() != null ? request.getDifficulty() : "MEDIUM");

        User assignedUser = resolveAssignedUser(request.getAssignedToId(), currentUser);
        task.setAssignedTo(assignedUser);

        // Set due date
        if (request.getDueDate() != null) {
            if (request.getDueDate().isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("Due date cannot be in the past");
            }
            task.setDueDate(request.getDueDate());
        }

        Task saved = taskRepository.save(task);
        
        // Log Activity
        activityService.logActivity("CREATE", currentUser.getName(), saved.getTitle());
        
        return TaskResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks() {
        User currentUser = getCurrentUser();
        String role = getCurrentRole();

        List<Task> tasks;
        if ("ADMIN".equalsIgnoreCase(role)) {
            tasks = taskRepository.findAllByOrderByCreatedAtDesc();
        } else {
            tasks = taskRepository.findByAssignedToOrderByCreatedAtDesc(currentUser);
        }

        return tasks.stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse getStats() {
        User currentUser = getCurrentUser();
        String role = getCurrentRole();

        if ("ADMIN".equalsIgnoreCase(role)) {
            long total = taskRepository.count();
            long todo = taskRepository.countByStatus(TaskStatus.TODO);
            long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
            long done = taskRepository.countByStatus(TaskStatus.DONE);
            return new TaskStatsResponse(total, todo, inProgress, done);
        } else {
            long total = taskRepository.countByAssignedTo(currentUser);
            long todo = taskRepository.countByAssignedToAndStatus(currentUser, TaskStatus.TODO);
            long inProgress = taskRepository.countByAssignedToAndStatus(currentUser, TaskStatus.IN_PROGRESS);
            long done = taskRepository.countByAssignedToAndStatus(currentUser, TaskStatus.DONE);
            return new TaskStatsResponse(total, todo, inProgress, done);
        }
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        User currentUser = getCurrentUser();
        String role = getCurrentRole();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        if (!"ADMIN".equalsIgnoreCase(role) && !isAssignedTo(task, currentUser)) {
            throw new RuntimeException("Access denied: You can only view your own tasks");
        }

        return TaskResponse.fromEntity(task);
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        User currentUser = getCurrentUser();
        String role = getCurrentRole();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        if (!"ADMIN".equalsIgnoreCase(role) && !isAssignedTo(task, currentUser)) {
            throw new RuntimeException("Access denied: You can only update your own tasks");
        }

        String oldStatus = task.getStatus().toString();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());

        // Handle completion timestamp and score
        if (request.getStatus() == TaskStatus.DONE && !oldStatus.equals("DONE")) {
            task.setCompletedAt(java.time.LocalDateTime.now());
            
            // Update User Score & Streaks
            User assignee = task.getAssignedTo() != null ? task.getAssignedTo() : task.getUser();
            int scoreChange = performanceService.calculateScoreChange(task);
            int streakBonus = performanceService.updateStreakAndGetBonus(assignee);
            
            assignee.setPerformanceScore(assignee.getPerformanceScore() + scoreChange + streakBonus);
            userRepository.save(assignee);
        }

        if (request.getAssignedToId() != null) {
            if (!"ADMIN".equalsIgnoreCase(role)) {
                if (!request.getAssignedToId().equals(currentUser.getId())) {
                    throw new RuntimeException("Access denied: Only admins can reassign tasks");
                }
            }
            User assignedUser = resolveAssignedUser(request.getAssignedToId(), currentUser);
            task.setAssignedTo(assignedUser);
        } else if (task.getAssignedTo() == null) {
            task.setAssignedTo(currentUser);
        }

        // Handle due date update
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        Task updated = taskRepository.save(task);

        // Log Activity: Check if it was a status move or general update
        String action = oldStatus.equals(updated.getStatus().toString()) ? "UPDATE" : "MOVE";
        activityService.logActivity(action, currentUser.getName(), updated.getTitle());

        return TaskResponse.fromEntity(updated);
    }

    public void deleteTask(Long id) {
        User currentUser = getCurrentUser();
        String role = getCurrentRole();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        if (!"ADMIN".equalsIgnoreCase(role) && !isAssignedTo(task, currentUser)) {
            throw new RuntimeException("Access denied: You can only delete your own tasks");
        }

        String title = task.getTitle();
        taskRepository.delete(task);
        
        // Log Activity
        activityService.logActivity("DELETE", currentUser.getName(), title);
    }

    /**
     * GET OVERDUE TASKS
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> getOverdueTasks() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        return getTasks().stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now) && t.getStatus() != TaskStatus.DONE)
                .collect(Collectors.toList());
    }

    /**
     * GET TASKS DUE TODAY
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksDueToday() {
        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        java.time.LocalDateTime endOfDay = java.time.LocalDate.now().atTime(23, 59, 59);

        return getTasks().stream()
                .filter(t -> t.getDueDate() != null && !t.getDueDate().isBefore(startOfDay) && !t.getDueDate().isAfter(endOfDay))
                .collect(Collectors.toList());
    }

    private boolean isAssignedTo(Task task, User user) {
        if (task.getAssignedTo() != null) {
            return task.getAssignedTo().getId().equals(user.getId());
        }
        return task.getUser().getId().equals(user.getId());
    }
}
