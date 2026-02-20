package com.nexora.userservice.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nexora.userservice.dto.ProjectRequest;
import com.nexora.userservice.entity.Project;
import com.nexora.userservice.entity.ProjectMember;
import com.nexora.userservice.entity.User;
import com.nexora.userservice.repository.ProjectMemberRepository;
import com.nexora.userservice.repository.UserRepository;
import com.nexora.userservice.service.ProjectMemberService;
import com.nexora.userservice.service.ProjectService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "https://nexora-prod.vercel.app"})
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMemberService projectMemberService;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Project API is working! 🚀");
    }

    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestBody ProjectRequest request,
            @RequestParam String firebaseUid
    ) {
        // Create project
        Project project = projectService.createProject(
                request.getName(),
                request.getDescription(),
                firebaseUid
        );

        // Automatically add creator as OWNER member
        User owner = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ProjectMember ownerMember = new ProjectMember();
        ownerMember.setProject(project);
        ownerMember.setUser(owner);
        ownerMember.setRole(ProjectMember.MemberRole.OWNER);
        projectMemberRepository.save(ownerMember);

        return ResponseEntity.ok(project);
    }

    @GetMapping("/user/{firebaseUid}")
    public ResponseEntity<List<Project>> getUserProjects(@PathVariable String firebaseUid) {
        // Get projects owned by user
        List<Project> ownedProjects = projectService.getUserProjects(firebaseUid);

        // Get projects where user is a member
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<ProjectMember> memberships = projectMemberRepository.findByUser(user);
        List<Project> memberProjects = memberships.stream()
                .map(ProjectMember::getProject)
                .filter(project -> !project.getOwner().getId().equals(user.getId())) // Exclude owned projects
                .collect(Collectors.toList());

        // Combine and return
        List<Project> allProjects = new ArrayList<>(ownedProjects);
        allProjects.addAll(memberProjects);

        return ResponseEntity.ok(allProjects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(
            @PathVariable Long id,
            @RequestParam String firebaseUid
    ) {
        // Check access
        if (!projectMemberService.hasAccess(id, firebaseUid)) {
            return ResponseEntity.status(403).build();
        }

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