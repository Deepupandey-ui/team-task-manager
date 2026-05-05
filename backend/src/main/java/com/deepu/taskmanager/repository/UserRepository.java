package com.deepu.taskmanager.repository;

import com.deepu.taskmanager.entity.User;
import com.deepu.taskmanager.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
   

Optional<User> findByEmail(String email);
List<User> findByCompany(Company company);
long countByCompany(Company company);
}
