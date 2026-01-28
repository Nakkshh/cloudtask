package com.cloudtask.userservice.service;

import com.cloudtask.userservice.entity.Project;
import com.cloudtask.userservice.entity.User;
import com.cloudtask.userservice.repository.ProjectRepository;
import com.cloudtask.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public Project createProject(String name, String description, String firebaseUid) {
        User owner = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setOwner(owner);

        return projectRepository.save(project);
    }

    public List<Project> getUserProjects(String firebaseUid) {
        User owner = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return projectRepository.findByOwnerOrderByCreatedAtDesc(owner);
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    @Transactional
    public void deleteProject(Long id, String firebaseUid) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User owner = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!project.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Only project owner can delete");
        }

        projectRepository.delete(project);
    }

    @Transactional
    public Project updateProject(Long id, String name, String description, String firebaseUid) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User owner = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!project.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Only project owner can update");
        }

        project.setName(name);
        project.setDescription(description);

        return projectRepository.save(project);
    }
}
