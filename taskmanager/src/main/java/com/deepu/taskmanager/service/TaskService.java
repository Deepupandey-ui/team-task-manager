package com.deepu.taskmanager.service;

import com.deepu.taskmanager.dto.TaskRequest;
import com.deepu.taskmanager.dto.TaskResponse;
import com.deepu.taskmanager.entity.Task;
import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.repository.TaskRepository;
import com.deepu.taskmanager.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // Constructor injection
    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get current logged-in user from SecurityContext
     */
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found in database"));
    }

    /**
     * Get current user's role from SecurityContext
     */
    private String getCurrentRole() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("USER");
    }

    /**
     * CREATE TASK — any authenticated user can create a task
     */
    public TaskResponse createTask(TaskRequest request) {
        User currentUser = getCurrentUser();

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setUser(currentUser);

        Task saved = taskRepository.save(task);
        return TaskResponse.fromEntity(saved);
    }

    /**
     * GET TASKS
     * ADMIN → all tasks
     * USER → only their own tasks
     */
    public List<TaskResponse> getTasks() {
        User currentUser = getCurrentUser();
        String role = getCurrentRole();

        List<Task> tasks;
        if ("ADMIN".equalsIgnoreCase(role)) {
            tasks = taskRepository.findAllByOrderByCreatedAtDesc();
        } else {
            tasks = taskRepository.findByUserOrderByCreatedAtDesc(currentUser);
        }

        return tasks.stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * GET SINGLE TASK BY ID
     */
    public TaskResponse getTaskById(Long id) {
        User currentUser = getCurrentUser();
        String role = getCurrentRole();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // USER can only view their own tasks
        if (!"ADMIN".equalsIgnoreCase(role) && !task.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: You can only view your own tasks");
        }

        return TaskResponse.fromEntity(task);
    }

    /**
     * UPDATE TASK
     * ADMIN → can update any task
     * USER → can only update their own tasks
     */
    public TaskResponse updateTask(Long id, TaskRequest request) {
        User currentUser = getCurrentUser();
        String role = getCurrentRole();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Authorization check
        if (!"ADMIN".equalsIgnoreCase(role) && !task.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: You can only update your own tasks");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());

        Task updated = taskRepository.save(task);
        return TaskResponse.fromEntity(updated);
    }

    /**
     * DELETE TASK
     * ADMIN → can delete any task
     * USER → can only delete their own tasks
     */
    public void deleteTask(Long id) {
        User currentUser = getCurrentUser();
        String role = getCurrentRole();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Authorization check
        if (!"ADMIN".equalsIgnoreCase(role) && !task.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: You can only delete your own tasks");
        }

        taskRepository.delete(task);
    }
}
