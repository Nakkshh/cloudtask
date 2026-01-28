package com.cloudtask.userservice.repository;

import com.cloudtask.userservice.entity.Project;
import com.cloudtask.userservice.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectOrderByCreatedAtDesc(Project project);
    List<Task> findByProjectAndStatus(Project project, Task.TaskStatus status);
}
