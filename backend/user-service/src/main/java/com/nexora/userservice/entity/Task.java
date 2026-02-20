package com.nexora.userservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    private String status; // TODO, IN_PROGRESS, DONE
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    
    @Column(name = "created_by")
    private String createdBy;
    
    // ========================================
    // ASSIGNEE FIELDS (Single + Multiple)
    // ========================================
    
    // Multi-assignee support (stored as JSON)
    @Column(name = "assignees", columnDefinition = "TEXT")
    private String assigneesJson;
    
    // Backward compatibility - first assignee
    @Column(name = "assignee_user_id")
    private String assigneeUserId;
    
    @Column(name = "assignee_name")
    private String assigneeName;
    
    @Column(name = "assignee_email")
    private String assigneeEmail;
    
    @Column(name = "assignee_photo")
    private String assigneePhoto;
    
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
    
    @Column(name = "assigned_by")
    private String assignedBy;
    
    // Transient field for multi-assignee operations
    @Transient
    private List<TaskAssignee> assignees;
    
    // ========================================
    // CONSTRUCTORS
    // ========================================
    
    public Task() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "TODO";
    }
    
    public Task(String title, String description, Project project, String createdBy) {
        this();
        this.title = title;
        this.description = description;
        this.project = project;
        this.createdBy = createdBy;
    }
    
    // ========================================
    // GETTERS AND SETTERS
    // ========================================
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Project getProject() {
        return project;
    }
    
    public void setProject(Project project) {
        this.project = project;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    // ========================================
    // SINGLE ASSIGNEE GETTERS/SETTERS (Backward Compatibility)
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
    
    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
    
    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
    
    public String getAssignedBy() {
        return assignedBy;
    }
    
    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }
    
    public String getAssigneesJson() {
        return assigneesJson;
    }
    
    public void setAssigneesJson(String assigneesJson) {
        this.assigneesJson = assigneesJson;
    }
    
    // ========================================
    // MULTI-ASSIGNEE METHODS
    // ========================================
    
    public List<TaskAssignee> getAssignees() {
        if (assignees == null && assigneesJson != null && !assigneesJson.isEmpty()) {
            try {
                assignees = parseAssigneesFromJson(assigneesJson);
            } catch (Exception e) {
                assignees = new ArrayList<>();
            }
        }
        return assignees != null ? assignees : new ArrayList<>();
    }
    
    public void setAssignees(List<TaskAssignee> assignees) {
        this.assignees = assignees;
        this.assigneesJson = convertAssigneesToJson(assignees);
        
        // Set first assignee as primary for backward compatibility
        if (assignees != null && !assignees.isEmpty()) {
            TaskAssignee primary = assignees.get(0);
            this.assigneeUserId = primary.getFirebaseUid();
            this.assigneeName = primary.getName();
            this.assigneeEmail = primary.getEmail();
            this.assigneePhoto = primary.getPhotoUrl();
        } else {
            this.assigneeUserId = null;
            this.assigneeName = null;
            this.assigneeEmail = null;
            this.assigneePhoto = null;
        }
    }
    
    // Parse JSON to List<TaskAssignee>
    private List<TaskAssignee> parseAssigneesFromJson(String json) {
        List<TaskAssignee> result = new ArrayList<>();
        if (json == null || json.trim().isEmpty() || json.equals("[]")) {
            return result;
        }
        
        try {
            json = json.trim();
            if (json.startsWith("[") && json.endsWith("]")) {
                json = json.substring(1, json.length() - 1).trim();
                
                if (json.isEmpty()) {
                    return result;
                }
                
                // Split by "},{"
                String[] items = json.split("\\},\\s*\\{");
                
                for (String item : items) {
                    item = item.replace("{", "").replace("}", "").trim();
                    
                    TaskAssignee assignee = new TaskAssignee();
                    
                    // Parse key-value pairs
                    String[] pairs = item.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"); // Split by comma not in quotes
                    
                    for (String pair : pairs) {
                        String[] kv = pair.split(":", 2);
                        if (kv.length == 2) {
                            String key = kv[0].trim().replace("\"", "");
                            String value = kv[1].trim();
                            
                            // Remove quotes from value
                            if (value.startsWith("\"") && value.endsWith("\"")) {
                                value = value.substring(1, value.length() - 1);
                            }
                            
                            switch (key) {
                                case "firebaseUid":
                                    assignee.setFirebaseUid(value);
                                    break;
                                case "name":
                                    assignee.setName(value);
                                    break;
                                case "email":
                                    assignee.setEmail(value);
                                    break;
                                case "photoUrl":
                                    assignee.setPhotoUrl(value.isEmpty() ? null : value);
                                    break;
                            }
                        }
                    }
                    
                    result.add(assignee);
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing assignees JSON: " + e.getMessage());
        }
        
        return result;
    }
    
    // Convert List<TaskAssignee> to JSON
    private String convertAssigneesToJson(List<TaskAssignee> assignees) {
        if (assignees == null || assignees.isEmpty()) {
            return "[]";
        }
        
        StringBuilder json = new StringBuilder("[");
        
        for (int i = 0; i < assignees.size(); i++) {
            TaskAssignee a = assignees.get(i);
            
            if (i > 0) {
                json.append(",");
            }
            
            json.append("{");
            json.append("\"firebaseUid\":\"").append(escapeJson(a.getFirebaseUid())).append("\",");
            json.append("\"name\":\"").append(escapeJson(a.getName())).append("\",");
            json.append("\"email\":\"").append(escapeJson(a.getEmail())).append("\",");
            json.append("\"photoUrl\":\"").append(a.getPhotoUrl() != null ? escapeJson(a.getPhotoUrl()) : "").append("\"");
            json.append("}");
        }
        
        json.append("]");
        return json.toString();
    }
    
    // Escape special characters in JSON strings
    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r");
    }
    
    // ========================================
    // HELPER METHODS
    // ========================================
    
    public boolean isAssigned() {
        return assigneeUserId != null || (assigneesJson != null && !assigneesJson.equals("[]"));
    }
    
    public boolean isAssignedTo(String userId) {
        if (assigneeUserId != null && assigneeUserId.equals(userId)) {
            return true;
        }
        
        List<TaskAssignee> list = getAssignees();
        return list.stream().anyMatch(a -> a.getFirebaseUid().equals(userId));
    }
    
    public String getAssigneeDisplayName() {
        if (assigneeName != null && !assigneeName.isEmpty()) {
            return assigneeName;
        }
        if (assigneeEmail != null && !assigneeEmail.isEmpty()) {
            return assigneeEmail;
        }
        
        List<TaskAssignee> list = getAssignees();
        if (!list.isEmpty()) {
            return list.get(0).getName();
        }
        
        return "Unassigned";
    }
    
    @Override
    public String toString() {
        return "Task{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", status='" + status + '\'' +
                ", assignees=" + getAssignees().size() +
                ", createdAt=" + createdAt +
                '}';
    }
    
    // ========================================
    // INNER CLASS: TaskAssignee
    // ========================================
    
    public static class TaskAssignee {
        private String firebaseUid;
        private String name;
        private String email;
        private String photoUrl;
        
        public TaskAssignee() {}
        
        public TaskAssignee(String firebaseUid, String name, String email, String photoUrl) {
            this.firebaseUid = firebaseUid;
            this.name = name;
            this.email = email;
            this.photoUrl = photoUrl;
        }
        
        // Getters and Setters
        public String getFirebaseUid() {
            return firebaseUid;
        }
        
        public void setFirebaseUid(String firebaseUid) {
            this.firebaseUid = firebaseUid;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public String getPhotoUrl() {
            return photoUrl;
        }
        
        public void setPhotoUrl(String photoUrl) {
            this.photoUrl = photoUrl;
        }
        
        @Override
        public String toString() {
            return "TaskAssignee{" +
                    "name='" + name + '\'' +
                    ", email='" + email + '\'' +
                    '}';
        }
    }
}