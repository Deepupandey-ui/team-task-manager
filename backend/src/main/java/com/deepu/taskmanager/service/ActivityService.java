package com.deepu.taskmanager.service;

import com.deepu.taskmanager.entity.Activity;
import com.deepu.taskmanager.repository.ActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ActivityService {
    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public void logActivity(String action, String userName, String taskTitle) {
        Activity activity = new Activity(action, userName, taskTitle);
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<Activity> getRecentActivities() {
        return activityRepository.findTop3ByOrderByTimestampDesc();
    }
}
