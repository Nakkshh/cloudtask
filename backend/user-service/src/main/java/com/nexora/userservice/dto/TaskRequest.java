package com.nexora.userservice.dto;

import lombok.Data;

@Data
public class TaskRequest {
    private String title;
    private String description;
    private Long projectId;
    private String status; // TODO, IN_PROGRESS, DONE
}
