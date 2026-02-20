package com.nexora.userservice.repository;

import com.nexora.userservice.entity.Project;
import com.nexora.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerOrderByCreatedAtDesc(User owner);
}
