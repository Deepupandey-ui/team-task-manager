package com.deepu.taskmanager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action; // CREATE, UPDATE, DELETE, MOVE
    private String userName;
    private String taskTitle;
    private LocalDateTime timestamp;


    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    public Activity() {}

    public Activity(String action, String userName, String taskTitle, Company company) {
        this.action = action;
        this.userName = userName;
        this.taskTitle = taskTitle;
        this.company = company;
        this.timestamp = LocalDateTime.now();
    }


    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
}

