package com.deepu.taskmanager.service;

import com.deepu.taskmanager.entity.Task;
import com.deepu.taskmanager.entity.TaskStatus;
import com.deepu.taskmanager.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReminderService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationService notificationService;

    // Run every 30 minutes
    @Scheduled(fixedRate = 1800000)
    public void checkDeadlines() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soon = now.plusHours(1);

        List<Task> tasks = taskRepository.findAll();
        for (Task task : tasks) {
            if (task.getStatus() == TaskStatus.DONE) continue;

            if (task.getDueDate() != null) {
                if (task.getDueDate().isBefore(now)) {
                    notificationService.createNotification(task.getAssignedTo(), 
                        "URGENT: Task '" + task.getTitle() + "' is OVERDUE!", "OVERDUE");
                } else if (task.getDueDate().isBefore(soon)) {
                    notificationService.createNotification(task.getAssignedTo(), 
                        "Reminder: Task '" + task.getTitle() + "' is due within 1 hour.", "DUE_SOON");
                }
            }
        }
    }
}
