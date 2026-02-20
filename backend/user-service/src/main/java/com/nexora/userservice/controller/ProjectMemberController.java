package com.nexora.userservice.controller;

import com.nexora.userservice.dto.AddMemberRequest;
import com.nexora.userservice.dto.MemberResponse;
import com.nexora.userservice.entity.ProjectMember;
import com.nexora.userservice.service.ProjectMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/project/{projectId}/members")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "https://nexora-prod.vercel.app"})
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    @GetMapping
    public ResponseEntity<List<MemberResponse>> getMembers(@PathVariable Long projectId) {
        List<ProjectMember> members = projectMemberService.getProjectMembers(projectId);
        List<MemberResponse> response = members.stream()
                .map(MemberResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<MemberResponse> addMember(
            @PathVariable Long projectId,
            @RequestBody AddMemberRequest request,
            @RequestParam String requestorFirebaseUid
    ) {
        ProjectMember.MemberRole role = ProjectMember.MemberRole.valueOf(request.getRole());
        ProjectMember member = projectMemberService.addMember(
                projectId,
                request.getUserEmail(),
                role,
                requestorFirebaseUid
        );
        return ResponseEntity.ok(MemberResponse.fromEntity(member));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @RequestParam String requestorFirebaseUid
    ) {
        projectMemberService.removeMember(projectId, userId, requestorFirebaseUid);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/access")
    public ResponseEntity<Boolean> checkAccess(
            @PathVariable Long projectId,
            @RequestParam String firebaseUid
    ) {
        boolean hasAccess = projectMemberService.hasAccess(projectId, firebaseUid);
        return ResponseEntity.ok(hasAccess);
    }

    @GetMapping("/role")
    public ResponseEntity<String> getUserRole(
            @PathVariable Long projectId,
            @RequestParam String firebaseUid
    ) {
        ProjectMember.MemberRole role = projectMemberService.getUserRole(projectId, firebaseUid);
        return ResponseEntity.ok(role != null ? role.name() : "NONE");
    }
}