package com.cloudtask.userservice.dto;

import lombok.Data;

@Data
public class UserSyncRequest {
    private String firebaseUid;
    private String email;
    private String displayName;
    private String photoUrl;
}
