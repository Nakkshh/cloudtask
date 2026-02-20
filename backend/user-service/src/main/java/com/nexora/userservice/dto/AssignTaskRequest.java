package com.nexora.userservice.dto;

public class AssignTaskRequest {
    
    private String assigneeUserId;
    private String assigneeName;
    private String assigneeEmail;
    private String assigneePhoto;
    
    // ========================================
    // CONSTRUCTORS
    // ========================================
    
    public AssignTaskRequest() {}
    
    public AssignTaskRequest(String assigneeUserId, String assigneeName, 
                            String assigneeEmail, String assigneePhoto) {
        this.assigneeUserId = assigneeUserId;
        this.assigneeName = assigneeName;
        this.assigneeEmail = assigneeEmail;
        this.assigneePhoto = assigneePhoto;
    }
    
    // ========================================
    // GETTERS AND SETTERS
    // ========================================
    
    public String getAssigneeUserId() {
        return assigneeUserId;
    }
    
    public void setAssigneeUserId(String assigneeUserId) {
        this.assigneeUserId = assigneeUserId;
    }
    
    public String getAssigneeName() {
        return assigneeName;
    }
    
    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }
    
    public String getAssigneeEmail() {
        return assigneeEmail;
    }
    
    public void setAssigneeEmail(String assigneeEmail) {
        this.assigneeEmail = assigneeEmail;
    }
    
    public String getAssigneePhoto() {
        return assigneePhoto;
    }
    
    public void setAssigneePhoto(String assigneePhoto) {
        this.assigneePhoto = assigneePhoto;
    }
    
    // ========================================
    // VALIDATION HELPER
    // ========================================
    
    public boolean isValid() {
        return assigneeUserId != null && !assigneeUserId.trim().isEmpty();
    }
    
    @Override
    public String toString() {
        return "AssignTaskRequest{" +
                "assigneeUserId='" + assigneeUserId + '\'' +
                ", assigneeName='" + assigneeName + '\'' +
                ", assigneeEmail='" + assigneeEmail + '\'' +
                '}';
    }
}