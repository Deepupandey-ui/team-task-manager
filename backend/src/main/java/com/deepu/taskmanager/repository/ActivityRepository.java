package com.deepu.taskmanager.repository;

import com.deepu.taskmanager.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.deepu.taskmanager.entity.Company;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findTop3ByCompanyOrderByTimestampDesc(Company company);
}

