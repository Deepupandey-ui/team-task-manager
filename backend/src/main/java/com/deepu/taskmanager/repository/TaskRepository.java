package com.deepu.taskmanager.repository;

import com.deepu.taskmanager.entity.Task;
import com.deepu.taskmanager.entity.TaskStatus;
import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedToOrderByCreatedAtDesc(User assignedTo);

    List<Task> findAllByOrderByCreatedAtDesc();

    List<Task> findByCompanyOrderByCreatedAtDesc(Company company);

    long countByCompany(Company company);

    long countByCompanyAndStatus(Company company, TaskStatus status);

    long countByAssignedTo(User assignedTo);

    long countByAssignedToAndStatus(User assignedTo, TaskStatus status);
}

