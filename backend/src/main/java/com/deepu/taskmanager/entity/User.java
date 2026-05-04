package com.deepu.taskmanager.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String role;

    private String resetOtp;

    private java.time.LocalDateTime otpExpiry;

    @Column(name = "performance_score")
    private Integer performanceScore = 0;

    private Integer currentStreak = 0;
    private Integer longestStreak = 0;
    private java.time.LocalDateTime lastTaskDate;

    // GETTERS & SETTERS

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getResetOtp() { return resetOtp; }
    public void setResetOtp(String resetOtp) { this.resetOtp = resetOtp; }

    public java.time.LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(java.time.LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }

    public Integer getPerformanceScore() { 
        return performanceScore == null ? 0 : performanceScore; 
    }
    public void setPerformanceScore(Integer performanceScore) { this.performanceScore = performanceScore; }

    public Integer getCurrentStreak() { return currentStreak == null ? 0 : currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

    public Integer getLongestStreak() { return longestStreak == null ? 0 : longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }

    public java.time.LocalDateTime getLastTaskDate() { return lastTaskDate; }
    public void setLastTaskDate(java.time.LocalDateTime lastTaskDate) { this.lastTaskDate = lastTaskDate; }
}