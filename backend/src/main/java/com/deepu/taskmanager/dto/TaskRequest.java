package com.deepu.taskmanager.dto;

import com.deepu.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    private Long assignedToId; // nullable — if null, assign to self (creator)

    @NotNull(message = "Due date is required")
    private java.time.LocalDateTime dueDate;

    private String difficulty; // EASY, MEDIUM, HARD

    // Constructors
    public TaskRequest() {}

    public TaskRequest(String title, String description, TaskStatus status, Long assignedToId, java.time.LocalDateTime dueDate) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.assignedToId = assignedToId;
        this.dueDate = dueDate;
    }

    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

    public java.time.LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(java.time.LocalDateTime dueDate) { this.dueDate = dueDate; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}
