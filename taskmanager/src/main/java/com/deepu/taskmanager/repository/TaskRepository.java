package com.deepu.taskmanager.repository;

import com.deepu.taskmanager.entity.Task;
import com.deepu.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByCreatedAtDesc(User user);

    List<Task> findAllByOrderByCreatedAtDesc();
}
