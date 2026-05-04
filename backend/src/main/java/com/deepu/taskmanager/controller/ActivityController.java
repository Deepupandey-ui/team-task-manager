package com.deepu.taskmanager.controller;

import com.deepu.taskmanager.entity.Activity;
import com.deepu.taskmanager.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    /**
     * GET RECENT ACTIVITIES
     * GET /activities
     */
    @GetMapping
    public ResponseEntity<?> getActivities() {
        try {
            List<Activity> activities = activityService.getRecentActivities();
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
