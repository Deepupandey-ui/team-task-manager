package com.deepu.taskmanager.config;

import com.deepu.taskmanager.entity.Company;
import com.deepu.taskmanager.repository.CompanyRepository;
import com.deepu.taskmanager.repository.UserRepository;
import com.deepu.taskmanager.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(CompanyRepository companyRepository, UserRepository userRepository, TaskRepository taskRepository) {
        return args -> {
            Company defaultCompany;
            if (companyRepository.count() == 0) {
                defaultCompany = companyRepository.save(new Company("Default Company"));
            } else {
                defaultCompany = companyRepository.findAll().get(0);
            }
                
            // Assign all orphaned users to default company
            userRepository.findAll().forEach(u -> {
                if (u.getCompany() == null) {
                    u.setCompany(defaultCompany);
                    userRepository.save(u);
                    System.out.println("Assigned user " + u.getName() + " to " + defaultCompany.getName());
                }
            });

            // Assign all orphaned tasks to default company
            taskRepository.findAll().forEach(t -> {
                if (t.getCompany() == null) {
                    t.setCompany(defaultCompany);
                    taskRepository.save(t);
                    System.out.println("Assigned task " + t.getTitle() + " to " + defaultCompany.getName());
                }
            });

        };
    }
}
