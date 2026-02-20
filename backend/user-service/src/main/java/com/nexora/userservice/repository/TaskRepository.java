package com.nexora.userservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nexora.userservice.entity.Project;
import com.nexora.userservice.entity.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // ========================================
    // EXISTING METHODS
    // ========================================
    
    /**
     * Find tasks by project, ordered by creation date descending
     */
    List<Task> findByProjectOrderByCreatedAtDesc(Project project);
    
    /**
     * Find tasks by project and status
     */
    List<Task> findByProjectAndStatus(Project project, String status);
    
    // ========================================
    // ✅ FIXED: MULTI-ASSIGNEE QUERY METHODS
    // ========================================
    
    /**
     * ✅ FIXED: Find all tasks assigned to a specific user
     * Now checks BOTH assigneeUserId AND assigneesJson fields
     */
    @Query("SELECT t FROM Task t WHERE " +
           "t.assigneeUserId = :userId OR " +
           "t.assigneesJson LIKE CONCAT('%\"firebaseUid\":\"', :userId, '\"%')")
    List<Task> findByAssigneeUserId(@Param("userId") String userId);
    
    /**
     * ✅ FIXED: Find tasks assigned to user, ordered by creation date
     */
    @Query("SELECT t FROM Task t WHERE " +
           "(t.assigneeUserId = :userId OR " +
           "t.assigneesJson LIKE CONCAT('%\"firebaseUid\":\"', :userId, '\"%')) " +
           "ORDER BY t.createdAt DESC")
    List<Task> findByAssigneeUserIdOrderByCreatedAtDesc(@Param("userId") String userId);
    
    /**
     * ✅ FIXED: Find tasks by project and assignee (using Project entity)
     */
    @Query("SELECT t FROM Task t WHERE " +
           "t.project = :project AND " +
           "(t.assigneeUserId = :assigneeUserId OR " +
           "t.assigneesJson LIKE CONCAT('%\"firebaseUid\":\"', :assigneeUserId, '\"%'))")
    List<Task> findByProjectAndAssigneeUserId(
        @Param("project") Project project, 
        @Param("assigneeUserId") String assigneeUserId
    );
    
    /**
     * ✅ FIXED: Find tasks by project ID and assignee
     */
    @Query("SELECT t FROM Task t WHERE " +
           "t.project.id = :projectId AND " +
           "(t.assigneeUserId = :assigneeUserId OR " +
           "t.assigneesJson LIKE CONCAT('%\"firebaseUid\":\"', :assigneeUserId, '\"%'))")
    List<Task> findByProjectIdAndAssigneeUserId(
        @Param("projectId") Long projectId, 
        @Param("assigneeUserId") String assigneeUserId
    );
    
    /**
     * ✅ FIXED: Find tasks by assignee and status
     */
    @Query("SELECT t FROM Task t WHERE " +
           "(t.assigneeUserId = :userId OR " +
           "t.assigneesJson LIKE CONCAT('%\"firebaseUid\":\"', :userId, '\"%')) " +
           "AND t.status = :status")
    List<Task> findByAssigneeUserIdAndStatus(
        @Param("userId") String userId, 
        @Param("status") String status
    );
    
    /**
     * Find unassigned tasks in a project (using Project entity)
     */
    @Query("SELECT t FROM Task t WHERE " +
           "t.project = :project AND " +
           "(t.assigneeUserId IS NULL AND " +
           "(t.assigneesJson IS NULL OR t.assigneesJson = '[]')) " +
           "ORDER BY t.createdAt DESC")
    List<Task> findUnassignedTasksByProject(@Param("project") Project project);
    
    /**
     * Find unassigned tasks in a project (using projectId)
     */
    @Query("SELECT t FROM Task t WHERE " +
           "t.project.id = :projectId AND " +
           "(t.assigneeUserId IS NULL AND " +
           "(t.assigneesJson IS NULL OR t.assigneesJson = '[]')) " +
           "ORDER BY t.createdAt DESC")
    List<Task> findUnassignedTasksByProjectId(@Param("projectId") Long projectId);
    
    /**
     * Find unassigned tasks by project and status
     */
    @Query("SELECT t FROM Task t WHERE " +
           "t.project = :project AND " +
           "(t.assigneeUserId IS NULL AND " +
           "(t.assigneesJson IS NULL OR t.assigneesJson = '[]')) " +
           "AND t.status = :status")
    List<Task> findUnassignedTasksByProjectAndStatus(
        @Param("project") Project project, 
        @Param("status") String status
    );
    
    /**
     * Find all assigned tasks in a project
     */
    @Query("SELECT t FROM Task t WHERE " +
           "t.project = :project AND " +
           "(t.assigneeUserId IS NOT NULL OR " +
           "(t.assigneesJson IS NOT NULL AND t.assigneesJson != '[]')) " +
           "ORDER BY t.createdAt DESC")
    List<Task> findAssignedTasksByProject(@Param("project") Project project);
    
    /**
     * ✅ FIXED: Count assigned tasks
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE " +
           "t.project.id = :projectId AND " +
           "(t.assigneeUserId = :userId OR " +
           "t.assigneesJson LIKE CONCAT('%\"firebaseUid\":\"', :userId, '\"%'))")
    Long countAssignedTasks(
        @Param("projectId") Long projectId, 
        @Param("userId") String userId
    );
    
    /**
     * ✅ FIXED: Count assigned tasks by status
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE " +
           "(t.assigneeUserId = :userId OR " +
           "t.assigneesJson LIKE CONCAT('%\"firebaseUid\":\"', :userId, '\"%')) " +
           "AND t.status = :status")
    Long countAssignedTasksByStatus(
        @Param("userId") String userId, 
        @Param("status") String status
    );
    
    /**
     * ✅ FIXED: Count assigned tasks by status in a specific project
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE " +
           "t.project.id = :projectId AND " +
           "(t.assigneeUserId = :userId OR " +
           "t.assigneesJson LIKE CONCAT('%\"firebaseUid\":\"', :userId, '\"%')) " +
           "AND t.status = :status")
    Long countAssignedTasksByProjectAndStatus(
        @Param("projectId") Long projectId, 
        @Param("userId") String userId, 
        @Param("status") String status
    );
    
    /**
     * ✅ FIXED: Check if user has assigned tasks
     */
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
           "FROM Task t WHERE " +
           "t.project.id = :projectId AND " +
           "(t.assigneeUserId = :userId OR " +
           "t.assigneesJson LIKE CONCAT('%\"firebaseUid\":\"', :userId, '\"%'))")
    boolean hasAssignedTasks(
        @Param("projectId") Long projectId, 
        @Param("userId") String userId
    );
    
    /**
     * Find tasks assigned by a specific user
     */
    List<Task> findByAssignedBy(String assignedBy);
    
    /**
     * Find tasks by project, ordered by assigned date
     */
    @Query("SELECT t FROM Task t WHERE " +
           "t.project = :project AND " +
           "(t.assigneeUserId IS NOT NULL OR " +
           "(t.assigneesJson IS NOT NULL AND t.assigneesJson != '[]')) " +
           "ORDER BY t.assignedAt DESC")
    List<Task> findByProjectOrderByAssignedAtDesc(@Param("project") Project project);
}