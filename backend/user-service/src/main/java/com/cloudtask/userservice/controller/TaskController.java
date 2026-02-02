package com.cloudtask.userservice.controller;

import com.cloudtask.userservice.dto.AssignTaskRequest;
import com.cloudtask.userservice.dto.TaskRequest;
import com.cloudtask.userservice.entity.Task;
import com.cloudtask.userservice.service.ProjectMemberService;
import com.cloudtask.userservice.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/task")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "https://cloudtask-prod.vercel.app"})
public class TaskController {

    private final TaskService taskService;
    private final ProjectMemberService projectMemberService;

    // ========================================
    // EXISTING ENDPOINTS
    // ========================================

    @GetMapping("/test")
        public ResponseEntity<String> test() {
            return ResponseEntity.ok("Task API is working! 🚀");
        }

        @PostMapping
    public ResponseEntity<Task> createTask(
            @RequestBody TaskRequest request,
            @RequestParam String firebaseUid
    ) {
        // Check if user has access to the project
        if (!projectMemberService.hasAccess(request.getProjectId(), firebaseUid)) {
            return ResponseEntity.status(403).build();
        }

        Task task = taskService.createTask(
                request.getTitle(),
                request.getDescription(),
                request.getProjectId(),
                firebaseUid  // ✅ NEW: Pass creator's UID
        );
        return ResponseEntity.ok(task);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getProjectTasks(
            @PathVariable Long projectId,
            @RequestParam String firebaseUid
    ) {
        // Check if user has access to the project
        if (!projectMemberService.hasAccess(projectId, firebaseUid)) {
            return ResponseEntity.status(403).build();
        }

        List<Task> tasks = taskService.getProjectTasks(projectId);
        return ResponseEntity.ok(tasks);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam String firebaseUid
    ) {
        // TODO: Add more granular permission checks (only assigned user or admin can update)
        Task task = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long id,
            @RequestParam String firebaseUid
    ) {
        try {
            // ✅ NEW: Use permission-based delete
            taskService.deleteTaskWithPermission(id, firebaseUid);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(403).body(error);
        }
    }

    // ========================================
    // NEW: ASSIGNEE ENDPOINTS
    // ========================================

    /**
     * Assign a task to a user
     * POST /api/task/{taskId}/assign
     */
    @PostMapping("/{taskId}/assign")
    public ResponseEntity<?> assignTask(
            @PathVariable Long taskId,
            @RequestBody AssignTaskRequest request,
            @RequestParam String requestorFirebaseUid) {
        
        // ✅ NEW: Check permission before assigning
        try {
            Task task = taskService.getTaskById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
            Long projectId = task.getProject().getId();
            
            if (!taskService.hasAssignPermission(projectId, requestorFirebaseUid)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Permission denied. Only OWNER and ADMIN can assign tasks.");
                return ResponseEntity.status(403).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Permission check failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }

        // 🔍 DEBUG LOGS
        System.out.println("════════════════════════════════════════");
        System.out.println("🔍 ASSIGN TASK REQUEST RECEIVED");
        System.out.println("════════════════════════════════════════");
        System.out.println("Task ID: " + taskId);
        System.out.println("Requestor Firebase UID: " + requestorFirebaseUid);
        System.out.println("Request DTO: " + request.toString());
        System.out.println("DTO Valid?: " + request.isValid());
        System.out.println("════════════════════════════════════════");
        
        try {
            Task task = taskService.assignTask(taskId, request, requestorFirebaseUid);
            System.out.println("✅ Task assigned successfully!");
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            System.err.println("════════════════════════════════════════");
            System.err.println("❌ ERROR ASSIGNING TASK");
            System.err.println("════════════════════════════════════════");
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("Error Message: " + e.getMessage());
            e.printStackTrace();
            System.err.println("════════════════════════════════════════");
            
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Unassign a task (remove assignee)
     * DELETE /api/task/{taskId}/assign
     */
    @DeleteMapping("/{taskId}/assign")
    public ResponseEntity<?> unassignTask(
            @PathVariable Long taskId,
            @RequestParam String requestorFirebaseUid) {
        try {
            Task task = taskService.unassignTask(taskId);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Reassign a task to another user
     * PUT /api/task/{taskId}/reassign
     */
    @PutMapping("/{taskId}/reassign")
    public ResponseEntity<?> reassignTask(
            @PathVariable Long taskId,
            @RequestBody AssignTaskRequest request,
            @RequestParam String requestorFirebaseUid) {
        try {
            Task task = taskService.reassignTask(taskId, request, requestorFirebaseUid);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all tasks assigned to current user (across all projects)
     * GET /api/task/my-tasks
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<Task>> getMyTasks(
            @RequestParam String firebaseUid) {
        List<Task> tasks = taskService.getTasksByAssignee(firebaseUid);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get all tasks assigned to a specific user by their firebaseUid
     * GET /api/task/assignee/{firebaseUid}
     */
    @GetMapping("/assignee/{firebaseUid}")
    public ResponseEntity<List<Task>> getTasksByAssigneeId(@PathVariable String firebaseUid) {
        List<Task> tasks = taskService.getTasksByAssignee(firebaseUid);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get tasks assigned to me in a specific project
     * GET /api/task/project/{projectId}/assigned-to-me
     */
    @GetMapping("/project/{projectId}/assigned-to-me")
    public ResponseEntity<List<Task>> getMyTasksInProject(
            @PathVariable Long projectId,
            @RequestParam String firebaseUid) {
        
        // Check if user has access to the project
        if (!projectMemberService.hasAccess(projectId, firebaseUid)) {
            return ResponseEntity.status(403).build();
        }

        List<Task> tasks = taskService.getTasksByProjectAndAssignee(projectId, firebaseUid);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get my tasks by status
     * GET /api/task/my-tasks/status/{status}
     */
    @GetMapping("/my-tasks/status/{status}")
    public ResponseEntity<List<Task>> getMyTasksByStatus(
            @PathVariable String status,
            @RequestParam String firebaseUid) {
        List<Task> tasks = taskService.getTasksByAssigneeAndStatus(firebaseUid, status);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get unassigned tasks in a project
     * GET /api/task/project/{projectId}/unassigned
     */
    @GetMapping("/project/{projectId}/unassigned")
    public ResponseEntity<List<Task>> getUnassignedTasks(
            @PathVariable Long projectId,
            @RequestParam String firebaseUid) {
        
        // Check if user has access to the project
        if (!projectMemberService.hasAccess(projectId, firebaseUid)) {
            return ResponseEntity.status(403).build();
        }

        List<Task> tasks = taskService.getUnassignedTasks(projectId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get all assigned tasks in a project
     * GET /api/task/project/{projectId}/assigned
     */
    @GetMapping("/project/{projectId}/assigned")
    public ResponseEntity<List<Task>> getAssignedTasks(
            @PathVariable Long projectId,
            @RequestParam String firebaseUid) {
        
        // Check if user has access to the project
        if (!projectMemberService.hasAccess(projectId, firebaseUid)) {
            return ResponseEntity.status(403).build();
        }

        List<Task> tasks = taskService.getAssignedTasks(projectId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get count of tasks assigned to me in a project
     * GET /api/task/project/{projectId}/my-count
     */
    @GetMapping("/project/{projectId}/my-count")
    public ResponseEntity<Map<String, Long>> getMyTaskCount(
            @PathVariable Long projectId,
            @RequestParam String firebaseUid) {
        
        // Check if user has access to the project
        if (!projectMemberService.hasAccess(projectId, firebaseUid)) {
            return ResponseEntity.status(403).build();
        }

        Long count = taskService.getAssignedTaskCount(projectId, firebaseUid);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get count of my tasks by status
     * GET /api/task/my-count/status/{status}
     */
    @GetMapping("/my-count/status/{status}")
    public ResponseEntity<Map<String, Long>> getMyTaskCountByStatus(
            @PathVariable String status,
            @RequestParam String firebaseUid) {
        
        Long count = taskService.getAssignedTaskCountByStatus(firebaseUid, status);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Check if I have any assigned tasks in a project
     * GET /api/task/project/{projectId}/has-tasks
     */
    @GetMapping("/project/{projectId}/has-tasks")
    public ResponseEntity<Map<String, Boolean>> hasAssignedTasks(
            @PathVariable Long projectId,
            @RequestParam String firebaseUid) {
        
        // Check if user has access to the project
        if (!projectMemberService.hasAccess(projectId, firebaseUid)) {
            return ResponseEntity.status(403).build();
        }

        boolean hasTasks = taskService.hasAssignedTasks(projectId, firebaseUid);
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasTasks", hasTasks);
        return ResponseEntity.ok(response);
    }

    /**
     * Get tasks that I assigned to others
     * GET /api/task/assigned-by-me
     */
    @GetMapping("/assigned-by-me")
    public ResponseEntity<List<Task>> getTasksAssignedByMe(
            @RequestParam String firebaseUid) {
        List<Task> tasks = taskService.getTasksAssignedBy(firebaseUid);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Bulk assign multiple tasks to a user
     * POST /api/task/bulk-assign
     */
    @PostMapping("/bulk-assign")
    public ResponseEntity<?> bulkAssignTasks(
            @RequestBody Map<String, Object> request,
            @RequestParam String firebaseUid) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> taskIds = (List<Long>) request.get("taskIds");
            
            AssignTaskRequest assigneeRequest = new AssignTaskRequest();
            assigneeRequest.setAssigneeUserId((String) request.get("assigneeUserId"));
            assigneeRequest.setAssigneeName((String) request.get("assigneeName"));
            assigneeRequest.setAssigneeEmail((String) request.get("assigneeEmail"));
            assigneeRequest.setAssigneePhoto((String) request.get("assigneePhoto"));
            
            List<Task> tasks = taskService.bulkAssignTasks(taskIds, assigneeRequest, firebaseUid);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Bulk unassign multiple tasks
     * POST /api/task/bulk-unassign
     */
    @PostMapping("/bulk-unassign")
    public ResponseEntity<?> bulkUnassignTasks(
            @RequestBody Map<String, List<Long>> request,
            @RequestParam String firebaseUid) {
        try {
            List<Long> taskIds = request.get("taskIds");
            List<Task> tasks = taskService.bulkUnassignTasks(taskIds);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Assign multiple users to a task
     * POST /api/task/{taskId}/assign-multiple
     */
    @PostMapping("/{taskId}/assign-multiple")
    public ResponseEntity<?> assignMultipleUsers(
            @PathVariable Long taskId,
            @RequestBody Map<String, Object> request,
            @RequestParam String requestorFirebaseUid) {
        
        // ✅ NEW: Check permission before assigning
        try {
            Task task = taskService.getTaskById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
            Long projectId = task.getProject().getId();
            
            if (!taskService.hasAssignPermission(projectId, requestorFirebaseUid)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Permission denied. Only OWNER and ADMIN can assign tasks.");
                return ResponseEntity.status(403).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Permission check failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }

        // 🔍 DEBUG LOGS
        System.out.println("════════════════════════════════════════");
        System.out.println("🔍 ASSIGN MULTIPLE USERS REQUEST");
        System.out.println("════════════════════════════════════════");
        System.out.println("Task ID: " + taskId);
        System.out.println("Requestor: " + requestorFirebaseUid);
        
        try {
            // Parse assignees from request
            @SuppressWarnings("unchecked")
            List<Map<String, String>> assigneesData = (List<Map<String, String>>) request.get("assignees");
            
            if (assigneesData == null || assigneesData.isEmpty()) {
                // Empty list means unassign all
                Task task = taskService.unassignTask(taskId);
                System.out.println("✅ Task unassigned (no assignees)!");
                return ResponseEntity.ok(task);
            }
            
            List<AssignTaskRequest> assignees = new ArrayList<>();
            for (Map<String, String> data : assigneesData) {
                AssignTaskRequest req = new AssignTaskRequest();
                req.setAssigneeUserId(data.get("firebaseUid"));
                req.setAssigneeName(data.get("name"));
                req.setAssigneeEmail(data.get("email"));
                req.setAssigneePhoto(data.get("photoUrl"));
                assignees.add(req);
            }
            
            System.out.println("Number of assignees: " + assignees.size());
            
            Task task = taskService.assignMultipleUsers(taskId, assignees, requestorFirebaseUid);
            System.out.println("✅ Task assigned to " + assignees.size() + " users!");
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}