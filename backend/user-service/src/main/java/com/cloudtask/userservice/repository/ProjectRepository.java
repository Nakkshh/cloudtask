package com.cloudtask.userservice.repository;

import com.cloudtask.userservice.entity.Project;
import com.cloudtask.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerOrderByCreatedAtDesc(User owner);
}
