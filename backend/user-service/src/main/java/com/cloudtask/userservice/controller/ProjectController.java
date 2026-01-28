package com.cloudtask.userservice.controller;

import com.cloudtask.userservice.dto.ProjectRequest;
import com.cloudtask.userservice.entity.Project;
import com.cloudtask.userservice.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Project API is working! 🚀");
    }

    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestBody ProjectRequest request,
            @RequestParam String firebaseUid
    ) {
        Project project = projectService.createProject(
                request.getName(),
                request.getDescription(),
                firebaseUid
        );
        return ResponseEntity.ok(project);
    }

    @GetMapping("/user/{firebaseUid}")
    public ResponseEntity<List<Project>> getUserProjects(@PathVariable String firebaseUid) {
        List<Project> projects = projectService.getUserProjects(firebaseUid);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @RequestParam String firebaseUid
    ) {
        projectService.deleteProject(id, firebaseUid);
        return ResponseEntity.noContent().build();
    }
}
