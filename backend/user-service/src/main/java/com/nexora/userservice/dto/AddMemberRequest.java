package com.nexora.userservice.dto;

import lombok.Data;

@Data
public class AddMemberRequest {
    private String userEmail;
    private String role; // ADMIN or MEMBER
}