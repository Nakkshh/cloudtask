package com.nexora.userservice.dto;

import com.nexora.userservice.entity.ProjectMember;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MemberResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String displayName;
    private String firebaseUid;  // 🆕 ADDED THIS!
    private String photoUrl;     // 🆕 BONUS: Also added photo
    private String role;
    private LocalDateTime joinedAt;

    public static MemberResponse fromEntity(ProjectMember member) {
        MemberResponse response = new MemberResponse();
        response.setId(member.getId());
        response.setUserId(member.getUser().getId());
        response.setUserEmail(member.getUser().getEmail());
        response.setDisplayName(member.getUser().getDisplayName());
        response.setFirebaseUid(member.getUser().getFirebaseUid());  // 🆕 ADDED THIS!
        response.setPhotoUrl(member.getUser().getPhotoUrl());        // 🆕 ADDED THIS!
        response.setRole(member.getRole().name());
        response.setJoinedAt(member.getJoinedAt());
        return response;
    }
}