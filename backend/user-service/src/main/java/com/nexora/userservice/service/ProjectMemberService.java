package com.nexora.userservice.service;

import com.nexora.userservice.entity.Project;
import com.nexora.userservice.entity.ProjectMember;
import com.nexora.userservice.entity.User;
import com.nexora.userservice.repository.ProjectMemberRepository;
import com.nexora.userservice.repository.ProjectRepository;
import com.nexora.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectMember addMember(Long projectId, String userEmail, ProjectMember.MemberRole role, String requestorFirebaseUid) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User requestor = userRepository.findByFirebaseUid(requestorFirebaseUid)
                .orElseThrow(() -> new RuntimeException("Requestor not found"));

        // Check if requestor is owner or admin
        if (!isOwner(project, requestor) && !isAdmin(project, requestor)) {
            throw new RuntimeException("Only owners and admins can add members");
        }

        User userToAdd = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if already a member
        if (projectMemberRepository.existsByProjectAndUser(project, userToAdd)) {
            throw new RuntimeException("User is already a member");
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(userToAdd);
        member.setRole(role);

        return projectMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(Long projectId, Long userId, String requestorFirebaseUid) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User requestor = userRepository.findByFirebaseUid(requestorFirebaseUid)
                .orElseThrow(() -> new RuntimeException("Requestor not found"));

        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if requestor is owner or admin
        if (!isOwner(project, requestor) && !isAdmin(project, requestor)) {
            throw new RuntimeException("Only owners and admins can remove members");
        }

        // Can't remove the owner
        if (isOwner(project, userToRemove)) {
            throw new RuntimeException("Cannot remove project owner");
        }

        projectMemberRepository.deleteByProjectAndUser(project, userToRemove);
    }

    public List<ProjectMember> getProjectMembers(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return projectMemberRepository.findByProject(project);
    }

    public boolean hasAccess(Long projectId, String firebaseUid) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Owner always has access
        if (project.getOwner().getId().equals(user.getId())) {
            return true;
        }

        // Check if member
        return projectMemberRepository.existsByProjectAndUser(project, user);
    }

    public ProjectMember.MemberRole getUserRole(Long projectId, String firebaseUid) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if owner
        if (project.getOwner().getId().equals(user.getId())) {
            return ProjectMember.MemberRole.OWNER;
        }

        // Get member role
        Optional<ProjectMember> member = projectMemberRepository.findByProjectAndUser(project, user);
        return member.map(ProjectMember::getRole).orElse(null);
    }

    private boolean isOwner(Project project, User user) {
        return project.getOwner().getId().equals(user.getId());
    }

    private boolean isAdmin(Project project, User user) {
        Optional<ProjectMember> member = projectMemberRepository.findByProjectAndUser(project, user);
        return member.isPresent() && member.get().getRole() == ProjectMember.MemberRole.ADMIN;
    }
}
