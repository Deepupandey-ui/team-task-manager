package com.deepu.taskmanager.repository;

import com.deepu.taskmanager.entity.Task;
import com.deepu.taskmanager.entity.TaskStatus;
import com.deepu.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByCreatedAtDesc(User user);

    List<Task> findByAssignedToOrderByCreatedAtDesc(User assignedTo);

    List<Task> findAllByOrderByCreatedAtDesc();

    long countByStatus(TaskStatus status);

    long countByAssignedTo(User assignedTo);

    long countByAssignedToAndStatus(User assignedTo, TaskStatus status);
}
