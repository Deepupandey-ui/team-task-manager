package com.deepu.taskmanager.service;

import com.deepu.taskmanager.entity.Activity;
import com.deepu.taskmanager.entity.Company;
import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.repository.ActivityRepository;
import com.deepu.taskmanager.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    public void logActivity(String action, String userName, String taskTitle, Company company) {
        Activity activity = new Activity(action, userName, taskTitle, company);
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<Activity> getRecentActivities() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return activityRepository.findTop3ByCompanyOrderByTimestampDesc(currentUser.getCompany());
    }
}

