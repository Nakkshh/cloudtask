package com.cloudtask.userservice.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudtask.userservice.dto.AssignTaskRequest;
import com.cloudtask.userservice.entity.Project;
import com.cloudtask.userservice.entity.ProjectMember;
import com.cloudtask.userservice.entity.Task;
import com.cloudtask.userservice.repository.ProjectMemberRepository;
import com.cloudtask.userservice.repository.ProjectRepository;
import com.cloudtask.userservice.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    // ========================================
    // EXISTING METHODS
    // ========================================

    @Transactional
    public Task createTask(String title, String description, Long projectId, String createdBy) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setProject(project);
        task.setCreatedBy(createdBy);  // ✅ NEW: Track who created the task
        task.setStatus("TODO");
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    public List<Task> getProjectTasks(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return taskRepository.findByProjectOrderByCreatedAtDesc(project);
    }

    @Transactional
    public Task updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    // ========================================
    // NEW: ASSIGNEE METHODS
    // ========================================

    /**
     * Assign a task to a user
     */
    @Transactional
    public Task assignTask(Long taskId, AssignTaskRequest request, String assignedBy) {
        // Find the task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        // ✅ NEW: If request has null/empty userId, unassign and return
        if (request.getAssigneeUserId() == null || request.getAssigneeUserId().isEmpty()) {
            System.out.println("🔄 Unassigning task (null assignee received)");
            return unassignTask(taskId);
        }

        // Verify that the assignee is a member of the project
        List<ProjectMember> members = projectMemberRepository
                .findByProject(task.getProject());

        // FIXED: Use m.getUser().getFirebaseUid()
        boolean isMember = members.stream()
                .anyMatch(m -> m.getUser().getFirebaseUid().equals(request.getAssigneeUserId()));

        if (!isMember) {
            throw new RuntimeException("User is not a member of this project. Please add them as a member first.");
        }

        // Assign the task
        task.setAssigneeUserId(request.getAssigneeUserId());
        task.setAssigneeName(request.getAssigneeName());
        task.setAssigneeEmail(request.getAssigneeEmail());
        task.setAssigneePhoto(request.getAssigneePhoto());
        task.setAssignedAt(LocalDateTime.now());
        task.setAssignedBy(assignedBy);
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    /**
     * Unassign a task (remove assignee)
     */
    @Transactional
    public Task unassignTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        // Clear all assignee fields (single assignee)
        task.setAssigneeUserId(null);
        task.setAssigneeName(null);
        task.setAssigneeEmail(null);
        task.setAssigneePhoto(null);
        task.setAssignedAt(null);
        task.setAssignedBy(null);
        
        // ✅ NEW: Clear multi-assignee data as well
        task.setAssignees(new ArrayList<>());  // This will set assigneesJson to "[]"
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    /**
     * Reassign task to another user
     */
    @Transactional
    public Task reassignTask(Long taskId, AssignTaskRequest newAssignee, String reassignedBy) {
        // Unassign first, then assign to new user
        unassignTask(taskId);
        return assignTask(taskId, newAssignee, reassignedBy);
    }

    /**
     * Get all tasks assigned to a specific user (across all projects)
     */
    public List<Task> getTasksByAssignee(String userId) {
        return taskRepository.findByAssigneeUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get tasks assigned to a user in a specific project
     */
    public List<Task> getTasksByProjectAndAssignee(Long projectId, String userId) {
        return taskRepository.findByProjectIdAndAssigneeUserId(projectId, userId);
    }

    /**
     * Get tasks assigned to user with specific status
     */
    public List<Task> getTasksByAssigneeAndStatus(String userId, String status) {
        return taskRepository.findByAssigneeUserIdAndStatus(userId, status);
    }

    /**
     * Get unassigned tasks in a project
     */
    public List<Task> getUnassignedTasks(Long projectId) {
        return taskRepository.findUnassignedTasksByProjectId(projectId);
    }

    /**
     * Get all assigned tasks in a project
     */
    public List<Task> getAssignedTasks(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return taskRepository.findAssignedTasksByProject(project);
    }

    /**
     * Get count of tasks assigned to a user in a project
     */
    public Long getAssignedTaskCount(Long projectId, String userId) {
        return taskRepository.countAssignedTasks(projectId, userId);
    }

    /**
     * Get count of assigned tasks by status for a user
     */
    public Long getAssignedTaskCountByStatus(String userId, String status) {
        return taskRepository.countAssignedTasksByStatus(userId, status);
    }

    /**
     * Check if a user has any assigned tasks in a project
     */
    public boolean hasAssignedTasks(Long projectId, String userId) {
        return taskRepository.hasAssignedTasks(projectId, userId);
    }

    /**
     * Get tasks that were assigned by a specific user
     */
    public List<Task> getTasksAssignedBy(String userId) {
        return taskRepository.findByAssignedBy(userId);
    }

    /**
     * Bulk assign multiple tasks to a user
     */
    @Transactional
    public List<Task> bulkAssignTasks(List<Long> taskIds, AssignTaskRequest request, String assignedBy) {
        return taskIds.stream()
                .map(taskId -> {
                    try {
                        return assignTask(taskId, request, assignedBy);
                    } catch (Exception e) {
                        // Log error but continue with other tasks
                        System.err.println("Failed to assign task " + taskId + ": " + e.getMessage());
                        return null;
                    }
                })
                .filter(task -> task != null)
                .toList();
    }

    /**
     * Bulk unassign multiple tasks
     */
    @Transactional
    public List<Task> bulkUnassignTasks(List<Long> taskIds) {
        return taskIds.stream()
                .map(taskId -> {
                    try {
                        return unassignTask(taskId);
                    } catch (Exception e) {
                        System.err.println("Failed to unassign task " + taskId + ": " + e.getMessage());
                        return null;
                    }
                })
                .filter(task -> task != null)
                .toList();
    }

    /**
     * Assign multiple users to a task
     */
    @Transactional
    public Task assignMultipleUsers(Long taskId, List<AssignTaskRequest> assignees, String assignedBy) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        
        // ✅ NEW: If empty list, unassign all
        if (assignees == null || assignees.isEmpty()) {
            System.out.println("🔄 Unassigning task (empty assignees list)");
            return unassignTask(taskId);
        }
        
        // Verify all assignees are members of the project
        List<ProjectMember> members = projectMemberRepository.findByProject(task.getProject());
        
        List<Task.TaskAssignee> taskAssignees = new ArrayList<>();
        
        for (AssignTaskRequest assignee : assignees) {
            // Verify membership
            boolean isMember = members.stream()
                    .anyMatch(m -> m.getUser().getFirebaseUid().equals(assignee.getAssigneeUserId()));
            
            if (!isMember) {
                throw new RuntimeException("User " + assignee.getAssigneeEmail() + " is not a member of this project");
            }
            
            // Add to assignees list
            taskAssignees.add(new Task.TaskAssignee(
                assignee.getAssigneeUserId(),
                assignee.getAssigneeName(),
                assignee.getAssigneeEmail(),
                assignee.getAssigneePhoto()
            ));
        }
        
        // Set assignees using the new method
        task.setAssignees(taskAssignees);
        task.setAssignedAt(LocalDateTime.now());
        task.setAssignedBy(assignedBy);
        task.setUpdatedAt(LocalDateTime.now());
        
        return taskRepository.save(task);
    }  

    // ========================================
    // NEW: RBAC PERMISSION CHECKS
    // ========================================

    /**
     * Check if user has permission to assign tasks
     * Only OWNER and ADMIN can assign
     */
    public boolean hasAssignPermission(Long projectId, String firebaseUid) {
        // Find project
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return false;
        }
        Project project = projectOpt.get();
        
        // Find all members of the project
        List<ProjectMember> members = projectMemberRepository.findByProject(project);
        
        // Find the specific member with matching firebaseUid
        Optional<ProjectMember> memberOpt = members.stream()
            .filter(m -> m.getUser().getFirebaseUid().equals(firebaseUid))
            .findFirst();
        
        if (memberOpt.isEmpty()) {
            return false;
        }
        
        ProjectMember member = memberOpt.get();
        ProjectMember.MemberRole role = member.getRole();
        
        // Only OWNER and ADMIN can assign tasks
        return role == ProjectMember.MemberRole.OWNER || 
            role == ProjectMember.MemberRole.ADMIN;
    }

    /**
     * Get user's role in a project
     */
    public String getUserRole(Long projectId, String firebaseUid) {
        // Find project
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isEmpty()) {
            return "NONE";
        }
        Project project = projectOpt.get();
        
        // Find all members
        List<ProjectMember> members = projectMemberRepository.findByProject(project);
        
        // Find specific member
        Optional<ProjectMember> memberOpt = members.stream()
            .filter(m -> m.getUser().getFirebaseUid().equals(firebaseUid))
            .findFirst();
        
        if (memberOpt.isEmpty()) {
            return "NONE";
        }
        
        // Convert ENUM to String
        return memberOpt.get().getRole().name();
    }

        // ========================================
    // DELETE PERMISSIONS (NEW)
    // ========================================
    
    /**
     * Delete task with role-based permissions
     * - OWNER & ADMIN: Can delete ANY task
     * - MEMBER: Can delete only tasks created by them
     */
    @Transactional
    public void deleteTaskWithPermission(Long taskId, String firebaseUid) {
        // Find the task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        
        // Get project and user role
        Long projectId = task.getProject().getId();
        String userRole = getUserRole(projectId, firebaseUid);
        
        // Check permissions
        if (userRole.equals("OWNER") || userRole.equals("ADMIN")) {
            // OWNER and ADMIN can delete any task
            taskRepository.deleteById(taskId);
            System.out.println("✅ Task deleted by " + userRole);
        } else if (userRole.equals("MEMBER")) {
            // MEMBER can only delete tasks they created
            if (task.getCreatedBy() != null && task.getCreatedBy().equals(firebaseUid)) {
                taskRepository.deleteById(taskId);
                System.out.println("✅ Task deleted by MEMBER (own task)");
            } else {
                throw new RuntimeException("Permission denied. Members can only delete tasks created by them.");
            }
        } else {
            throw new RuntimeException("Permission denied. User is not a member of this project.");
        }
    }
    
    /**
     * Check if user can delete a specific task
     */
    public boolean canDeleteTask(Long taskId, String firebaseUid) {
        try {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            
            Long projectId = task.getProject().getId();
            String userRole = getUserRole(projectId, firebaseUid);
            
            // OWNER and ADMIN can always delete
            if (userRole.equals("OWNER") || userRole.equals("ADMIN")) {
                return true;
            }
            
            // MEMBER can delete only their own tasks
            if (userRole.equals("MEMBER")) {
                return task.getCreatedBy() != null && task.getCreatedBy().equals(firebaseUid);
            }
            
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}