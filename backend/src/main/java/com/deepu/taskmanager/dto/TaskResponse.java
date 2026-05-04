package com.deepu.taskmanager.dto;

import com.deepu.taskmanager.entity.Task;
import com.deepu.taskmanager.entity.TaskStatus;

import java.time.LocalDateTime;

public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;

    // Creator info
    private String userEmail;
    private String userName;

    // Assigned user info
    private Long assignedToId;
    private String assignedToEmail;
    private String assignedToName;

    private LocalDateTime dueDate;
    private boolean overdue;
    private LocalDateTime completedAt;
    private String difficulty;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public TaskResponse() {}

    // Static factory method to convert Task entity → TaskResponse
    public static TaskResponse fromEntity(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());

        // Creator info
        response.setUserEmail(task.getUser().getEmail());
        response.setUserName(task.getUser().getName());

        // Assigned user info
        if (task.getAssignedTo() != null) {
            response.setAssignedToId(task.getAssignedTo().getId());
            response.setAssignedToEmail(task.getAssignedTo().getEmail());
            response.setAssignedToName(task.getAssignedTo().getName());
        } else {
            // Fallback: if no assignee, show creator as assignee
            response.setAssignedToId(task.getUser().getId());
            response.setAssignedToEmail(task.getUser().getEmail());
            response.setAssignedToName(task.getUser().getName());
        }

        // Due date and Overdue logic
        response.setDueDate(task.getDueDate());
        response.setCompletedAt(task.getCompletedAt());
        response.setDifficulty(task.getDifficulty());
        if (task.getDueDate() != null) {
            try {
                boolean isOverdue = task.getDueDate().isBefore(LocalDateTime.now()) && 
                                   task.getStatus() != TaskStatus.DONE;
                response.setOverdue(isOverdue);
            } catch (Exception e) {
                response.setOverdue(false);
            }
        }

        return response;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

    public String getAssignedToEmail() { return assignedToEmail; }
    public void setAssignedToEmail(String assignedToEmail) { this.assignedToEmail = assignedToEmail; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public boolean isOverdue() { return overdue; }
    public void setOverdue(boolean overdue) { this.overdue = overdue; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}
