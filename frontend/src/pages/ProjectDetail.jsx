import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useAuth } from "../auth/useAuth";
import AssigneeDropdown from "../components/AssigneeDropdown";
import MultiAssignDropdown from "../components/MultiAssignDropdown";  // ← ADDED
import { 
  getProject, 
  getProjectTasks, 
  createTask, 
  updateTaskStatus, 
  deleteTask,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  assignTask,
  assignMultipleTasks  // ← ADDED
} from "../services/api";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [newTaskAssignees, setNewTaskAssignees] = useState([]);
  const [newMember, setNewMember] = useState({ email: "", role: "MEMBER" });
  const [activeTab, setActiveTab] = useState("tasks");
  const [assigningTask, setAssigningTask] = useState(null);
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const [projectData, tasksData, membersData] = await Promise.all([
        getProject(id, user.uid),
        getProjectTasks(id, user.uid),
        getProjectMembers(id),
      ]);
      
      console.log('🔍 Members data structure:', membersData);
      
      setProject(projectData);
      setTasks(tasksData);
      setMembers(membersData);
    } catch (error) {
      console.error("Failed to load project data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const createdTask = await createTask(newTask.title, newTask.description, id, user.uid);
      
      // ✅ NEW: Multi-assignee logic
      if (newTaskAssignees.length > 0 && createdTask.id) {
        console.log('🔍 Assigning multiple users to task:', {
          taskId: createdTask.id,
          assigneeCount: newTaskAssignees.length
        });
        
        await assignMultipleTasks(createdTask.id, newTaskAssignees, user.uid);
      }
      
      // Reset form
      setNewTask({ title: "", description: "" });
      setNewTaskAssignees([]);
      setShowCreateModal(false);
      loadProjectData();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task: " + (error.message || "Unknown error"));
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleAssignTask = async (taskId, assigneeUid) => {
    try {
      setAssigningTask(taskId);
      
      const member = members.find(m => m.firebaseUid === assigneeUid);
      
      const assigneeName = member?.displayName || member?.userEmail;
      const assigneeEmail = member?.userEmail;
      
      await assignTask(taskId, assigneeUid, user.uid, assigneeName, assigneeEmail);
      loadProjectData();
    } catch (error) {
      console.error("Failed to assign task:", error);
      alert("Failed to assign task: " + error.message);
    } finally {
      setAssigningTask(null);
    }
  };

  // ← NEW FUNCTION ADDED
  const handleMultiAssign = async (taskId, selectedMembers) => {
    try {
      setAssigningTask(taskId);
      
      if (selectedMembers.length === 0) {
        // Unassign all
        await assignTask(taskId, null, user.uid, null, null);
      } else {
        // Assign multiple
        await assignMultipleTasks(taskId, selectedMembers, user.uid);
      }
      
      loadProjectData();
    } catch (error) {
      console.error("Failed to assign members:", error);
      alert("Failed to assign members: " + error.message);
    } finally {
      setAssigningTask(null);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addProjectMember(id, newMember.email, newMember.role, user.uid);
      setNewMember({ email: "", role: "MEMBER" });
      setShowMemberModal(false);
      loadProjectData();
    } catch (error) {
      console.error("Failed to add member:", error);
      alert("Failed to add member. Make sure the user exists and is not already a member.");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm("Remove this member from the project?")) {
      try {
        await removeProjectMember(id, userId, user.uid);
        loadProjectData();
      } catch (error) {
        console.error("Failed to remove member:", error);
        alert("Failed to remove member. You may not have permission.");
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus, user.uid);
      loadProjectData();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      try {
        await deleteTask(taskId, user.uid);
        loadProjectData();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const getTasksByStatus = (status) => {
    let filteredTasks = tasks.filter((task) => task.status === status);
    
    // Apply assignee filter
    if (assigneeFilter === "me") {
      filteredTasks = filteredTasks.filter(task => {
        // Check both old single assignee and new multi-assignee
        if (task.assignees && task.assignees.length > 0) {
          return task.assignees.some(a => a.firebaseUid === user.uid);
        }
        return task.assigneeUserId === user.uid;
      });
    } else if (assigneeFilter === "unassigned") {
      filteredTasks = filteredTasks.filter(task => {
        const hasMultiAssignees = task.assignees && task.assignees.length > 0;
        const hasSingleAssignee = task.assigneeUserId;
        return !hasMultiAssignees && !hasSingleAssignee;
      });
    } else if (assigneeFilter !== "all") {
      // Filter by specific member
      filteredTasks = filteredTasks.filter(task => {
        if (task.assignees && task.assignees.length > 0) {
          return task.assignees.some(a => a.firebaseUid === assigneeFilter);
        }
        return task.assigneeUserId === assigneeFilter;
      });
    }
    
    return filteredTasks;
  };

  const isOwnerOrAdmin = () => {
    const currentUserMember = members.find(m => m.userEmail === user.email);
    return currentUserMember && (currentUserMember.role === "OWNER" || currentUserMember.role === "ADMIN");
  };

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return null;
    
    const member = members.find(m => m.firebaseUid === assigneeId);
    
    if (!member) return "Unknown";
    
    return member.displayName || member.userEmail || "Unknown User";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-semibold">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Modern Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="w-full px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <img 
                  src="/cloudtask-icon.svg" 
                  alt="CloudTask" 
                  className="w-10 h-10"
                />
                <h1 className="text-2xl font-black text-gray-900">CloudTask</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.displayName || "User"}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Project Header */}
      <div className="pt-24 pb-8 px-6 lg:px-12 max-w-7xl mx-auto border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div>
            <h2 className="text-5xl font-black text-gray-900 mb-2">{project?.name}</h2>
            <p className="text-xl text-gray-600">{project?.description || "No description"}</p>
          </div>
          {activeTab === "tasks" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="group relative px-8 py-4 bg-gray-900 text-white rounded-3xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
          {activeTab === "members" && isOwnerOrAdmin() && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="group relative px-8 py-4 bg-gray-900 text-white rounded-3xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Member
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-6 py-3 font-bold transition-all relative ${
              activeTab === "tasks"
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Tasks
            {activeTab === "tasks" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-t-lg"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`px-6 py-3 font-bold transition-all relative ${
              activeTab === "members"
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Members ({members.length})
            {activeTab === "members" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-t-lg"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="py-8 px-6 lg:px-12 max-w-7xl mx-auto">
        {activeTab === "tasks" ? (
          <>
            {/* Stats */}
            <div className="flex gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-600">{getTasksByStatus("TODO").length} To Do</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-600">{getTasksByStatus("IN_PROGRESS").length} In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-600">{getTasksByStatus("DONE").length} Done</span>
              </div>
            </div>

            {/* Assignee Filter */}
            <div className="mb-8 flex items-center justify-between bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-md">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-gray-900">Filter by Assignee:</label>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-medium text-gray-900 cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="all">All Tasks ({tasks.length})</option>
                  <option value="me">My Tasks ({tasks.filter(t => {
                    if (t.assignees && t.assignees.length > 0) {
                      return t.assignees.some(a => a.firebaseUid === user.uid);
                    }
                    return t.assigneeUserId === user.uid;
                  }).length})</option>
                  <option value="unassigned">Unassigned ({tasks.filter(t => {
                    const hasMulti = t.assignees && t.assignees.length > 0;
                    const hasSingle = t.assigneeUserId;
                    return !hasMulti && !hasSingle;
                  }).length})</option>
                  {members.length > 0 && <option disabled>──────────</option>}
                  {members.map(member => (
                    <option key={member.id} value={member.firebaseUid}>
                      {member.displayName || member.userEmail} ({tasks.filter(t => {
                        if (t.assignees && t.assignees.length > 0) {
                          return t.assignees.some(a => a.firebaseUid === member.firebaseUid);
                        }
                        return t.assigneeUserId === member.firebaseUid;
                      }).length})
                    </option>
                  ))}
                </select>
              </div>
              
              {assigneeFilter !== "all" && (
                <button
                  onClick={() => setAssigneeFilter("all")}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <KanbanColumn
                title="📋 To Do"
                status="TODO"
                tasks={getTasksByStatus("TODO")}
                members={members}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                onAssign={handleMultiAssign}
                getAssigneeName={getAssigneeName}
                assigningTask={assigningTask}
                colorClass="from-orange-400 to-orange-500"
              />
              <KanbanColumn
                title="🔄 In Progress"
                status="IN_PROGRESS"
                tasks={getTasksByStatus("IN_PROGRESS")}
                members={members}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                onAssign={handleMultiAssign}
                getAssigneeName={getAssigneeName}
                assigningTask={assigningTask}
                colorClass="from-blue-400 to-blue-500"
              />
              <KanbanColumn
                title="✅ Done"
                status="DONE"
                tasks={getTasksByStatus("DONE")}
                members={members}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                onAssign={handleMultiAssign}
                getAssigneeName={getAssigneeName}
                assigningTask={assigningTask}
                colorClass="from-green-400 to-green-500"
              />
            </div>
          </>
        ) : (
          // Members List
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl p-6 border-2 border-gray-100 hover:border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      member.role === "OWNER" ? "bg-gradient-to-br from-purple-500 to-purple-600" :
                      member.role === "ADMIN" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
                      "bg-gradient-to-br from-gray-400 to-gray-500"
                    }`}>
                      {member.displayName?.[0]?.toUpperCase() || member.userEmail?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{member.displayName || "User"}</h3>
                      <p className="text-sm text-gray-500">{member.userEmail}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    member.role === "OWNER" ? "bg-purple-100 text-purple-700" :
                    member.role === "ADMIN" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {member.role}
                  </span>
                  
                  {member.role !== "OWNER" && isOwnerOrAdmin() && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                      title="Remove member"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-gray-400 mt-3">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6 z-50 animate-fadeIn"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-gray-200 animate-scaleIn max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900">Create New Task</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 transition-colors text-gray-900 font-medium"
                  placeholder="E.g. Design homepage mockup"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 transition-colors h-32 resize-none text-gray-900"
                  placeholder="Add more details about this task..."
                />
              </div>
              
              {/* ✅ NEW: Multi-Assignee Dropdown */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Assign To (Optional)
                </label>
                
                {/* Checkbox list */}
                <div className="border-2 border-gray-200 rounded-2xl p-4 max-h-60 overflow-y-auto">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No members available</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map(member => {
                        const isSelected = newTaskAssignees.some(a => a.firebaseUid === member.firebaseUid);
                        
                        return (
                          <label
                            key={member.firebaseUid}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // Add member
                                  setNewTaskAssignees([
                                    ...newTaskAssignees,
                                    {
                                      firebaseUid: member.firebaseUid,
                                      name: member.displayName || member.userEmail,
                                      email: member.userEmail,
                                      photoUrl: member.photoUrl || null
                                    }
                                  ]);
                                } else {
                                  // Remove member
                                  setNewTaskAssignees(
                                    newTaskAssignees.filter(a => a.firebaseUid !== member.firebaseUid)
                                  );
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {(member.displayName || member.userEmail)?.[0]?.toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {member.displayName || member.userEmail}
                                </p>
                                <p className="text-xs text-gray-500">{member.role}</p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Selected count */}
                {newTaskAssignees.length > 0 && (
                  <p className="text-sm text-blue-600 font-semibold mt-2">
                    ✓ {newTaskAssignees.length} member{newTaskAssignees.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6 z-50 animate-fadeIn"
          onClick={() => setShowMemberModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-gray-200 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900">Add Member</h2>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  User Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 transition-colors text-gray-900 font-medium"
                  placeholder="user@example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">User must have an account already</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 transition-colors text-gray-900 font-medium"
                >
                  <option value="MEMBER">Member - Can view and edit tasks</option>
                  <option value="ADMIN">Admin - Can manage members and tasks</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Task Assignee Section with RBAC
function TaskAssigneeSection({ task, members, showAssignDropdown, setShowAssignDropdown, onAssign, assigningTask }) {
  const { user } = useAuth();
  
  // Check if current user is OWNER or ADMIN
  const isOwnerOrAdmin = () => {
    const currentUserMember = members.find(m => m.userEmail === user.email);
    return currentUserMember && (currentUserMember.role === "OWNER" || currentUserMember.role === "ADMIN");
  };
  
  const canEdit = isOwnerOrAdmin();
  
  return (
    <div className="mb-3 relative">
      {task.assignees && task.assignees.length > 0 ? (
        <div className={`p-2 rounded-lg border ${
          canEdit ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200'
        }`}>
          {/* Stacked Avatars */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center -space-x-2">
              {task.assignees.slice(0, 3).map((assignee, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                  title={assignee.name || assignee.email}
                >
                  {(assignee.name || assignee.email)?.[0]?.toUpperCase()}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
            
            {/* Show Edit button ONLY for OWNER/ADMIN */}
            {canEdit ? (
              <button
                onClick={() => setShowAssignDropdown(showAssignDropdown === task.id ? null : task.id)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic">View only</span>
            )}
          </div>
          
          {/* Assignee Names */}
          <div className={`text-xs font-semibold ${
            canEdit ? 'text-blue-700' : 'text-gray-600'
          }`}>
            {task.assignees.map(a => a.name || a.email).join(", ")}
          </div>
        </div>
      ) : task.assigneeUserId ? (
        // Fallback for old single-assignee format
        <div className={`p-2 rounded-lg border ${
          canEdit ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {(task.assigneeName || task.assigneeEmail)?.[0]?.toUpperCase() || "?"}
              </div>
              <span className={`text-xs font-semibold ${
                canEdit ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {task.assigneeName || task.assigneeEmail || "Assigned"}
              </span>
            </div>
            
            {/* Show Edit button ONLY for OWNER/ADMIN */}
            {canEdit ? (
              <button
                onClick={() => setShowAssignDropdown(showAssignDropdown === task.id ? null : task.id)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic">View only</span>
            )}
          </div>
        </div>
      ) : (
        // Unassigned - Show assign button ONLY for OWNER/ADMIN
        <>
          {canEdit ? (
            <button
              onClick={() => setShowAssignDropdown(showAssignDropdown === task.id ? null : task.id)}
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
            >
              + Assign to people
            </button>
          ) : (
            <div className="p-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 text-center italic">
              Unassigned
            </div>
          )}
        </>
      )}

      {/* Multi-Select Dropdown - Only show for OWNER/ADMIN */}
      {showAssignDropdown === task.id && canEdit && (
        <MultiAssignDropdown
          task={task}
          members={members}
          onAssign={(selectedMembers) => {
            onAssign(task.id, selectedMembers);
            setShowAssignDropdown(null);
          }}
          onClose={() => setShowAssignDropdown(null)}
          assigningTask={assigningTask === task.id}
        />
      )}
    </div>
  );
}

// Kanban Column Component with Multi-Assignee Support
// eslint-disable-next-line no-unused-vars
function KanbanColumn({ title, status, tasks, members, onStatusChange, onDelete, onAssign, getAssigneeName, assigningTask, colorClass }) {
  const statusOptions = ["TODO", "IN_PROGRESS", "DONE"];
  const currentIndex = statusOptions.indexOf(status);
  const [showAssignDropdown, setShowAssignDropdown] = useState(null);

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-xl min-h-[600px]">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-1 h-8 bg-gradient-to-b ${colorClass} rounded-full`}></div>
        <h3 className="text-xl font-black text-gray-900">{title}</h3>
        <span className="ml-auto px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">No tasks yet</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className={`group bg-gray-50 hover:bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                showAssignDropdown === task.id ? 'relative z-30' : 'relative z-10'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {task.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {task.description || "No description"}
              </p>

              {/* ← RBAC ASSIGNEE SECTION */}
              <TaskAssigneeSection
                task={task}
                members={members}
                showAssignDropdown={showAssignDropdown}
                setShowAssignDropdown={setShowAssignDropdown}
                onAssign={onAssign}
                assigningTask={assigningTask}
              />

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex gap-2">
                  {currentIndex > 0 && (
                    <button
                      onClick={() => onStatusChange(task.id, statusOptions[currentIndex - 1])}
                      className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-300 group/btn"
                      title="Move back"
                    >
                      <svg className="w-4 h-4 text-gray-600 group-hover/btn:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  {currentIndex < statusOptions.length - 1 && (
                    <button
                      onClick={() => onStatusChange(task.id, statusOptions[currentIndex + 1])}
                      className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-300 group/btn"
                      title="Move forward"
                    >
                      <svg className="w-4 h-4 text-gray-600 group-hover/btn:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}