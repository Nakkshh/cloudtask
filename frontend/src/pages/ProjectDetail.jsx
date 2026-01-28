import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useAuth } from "../auth/useAuth";
import { getProject, getProjectTasks, createTask, updateTaskStatus, deleteTask } from "../services/api";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const [projectData, tasksData] = await Promise.all([
        getProject(id),
        getProjectTasks(id),
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to load project data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask(newTask.title, newTask.description, id);
      setNewTask({ title: "", description: "" });
      setShowCreateModal(false);
      loadProjectData();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadProjectData();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      try {
        await deleteTask(taskId);
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
    return tasks.filter((task) => task.status === status);
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
            {/* Logo with Back Button - Far Left */}
            <div className="flex items-center gap-3">
                <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                </button>
                <h1 className="text-2xl font-black text-gray-900">⏰ CloudTask</h1>
            </div>

            {/* User & Logout - Far Right */}
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-5xl font-black text-gray-900 mb-2">{project?.name}</h2>
            <p className="text-xl text-gray-600">{project?.description || "No description"}</p>
          </div>
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
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-8">
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
      </div>

      {/* Kanban Board */}
      <div className="py-8 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TODO Column */}
          <KanbanColumn
            title="📋 To Do"
            status="TODO"
            tasks={getTasksByStatus("TODO")}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTask}
            colorClass="from-orange-400 to-orange-500"
          />

          {/* IN_PROGRESS Column */}
          <KanbanColumn
            title="🔄 In Progress"
            status="IN_PROGRESS"
            tasks={getTasksByStatus("IN_PROGRESS")}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTask}
            colorClass="from-blue-400 to-blue-500"
          />

          {/* DONE Column */}
          <KanbanColumn
            title="✅ Done"
            status="DONE"
            tasks={getTasksByStatus("DONE")}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteTask}
            colorClass="from-green-400 to-green-500"
          />
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6 z-50 animate-fadeIn"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-gray-200 animate-scaleIn"
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
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({ title, status, tasks, onStatusChange, onDelete, colorClass }) {
  const statusOptions = ["TODO", "IN_PROGRESS", "DONE"];
  const currentIndex = statusOptions.indexOf(status);

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
              className="group bg-gray-50 hover:bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {task.title}
              </h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {task.description || "No description"}
              </p>

              {/* Actions */}
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