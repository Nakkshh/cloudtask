import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useAuth } from "../auth/useAuth";
import { getUserProjects, createProject, deleteProject, getMyTasks, updateTaskStatus } from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [activeView, setActiveView] = useState("projects"); // "projects" or "tasks"

  useEffect(() => {
    if (user) {
      loadProjects();
      loadMyTasks();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const data = await getUserProjects(user.uid);
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyTasks = async () => {
    try {
      const data = await getMyTasks(user.uid);
      setMyTasks(data);
    } catch (error) {
      console.error("Failed to load my tasks:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProject.name, newProject.description, user.uid);
      setNewProject({ name: "", description: "" });
      setShowCreateModal(false);
      loadProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Delete this project? All tasks will be lost.")) {
      try {
        await deleteProject(projectId, user.uid);
        loadProjects();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus, user.uid);
      loadMyTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-semibold">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Mobile-Responsive Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo with invisible spacer */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Invisible spacer - reserves space for back button */}
              <div className="w-10 h-10"></div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img 
                  src="/nexora-icon.svg" 
                  alt="Nexora" 
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
                <h1 className="text-2xl font-black text-gray-900">Nexora</h1>
              </div>
            </div>
            {/* User & Logout - Mobile Responsive */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Info Card - Hidden on mobile, shown on tablet+ */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.displayName || "User"}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              {/* Mobile: Just Avatar */}
              <div className="md:hidden w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </div>
              {/* Logout Button - Icon on mobile, text on desktop */}
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-6 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl sm:rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                <span className="hidden sm:inline">Logout</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile-Responsive Main Content */}
      <div className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Mobile-Responsive Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2">
                {activeView === "projects" ? "My Projects" : "My Tasks"}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600">
                {activeView === "projects" 
                  ? `${projects.length} ${projects.length === 1 ? 'project' : 'projects'} in your workspace`
                  : `${myTasks.length} ${myTasks.length === 1 ? 'task' : 'tasks'} assigned to you`
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-1 border border-gray-200">
              <button
                onClick={() => setActiveView("projects")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeView === "projects"
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveView("tasks")}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeView === "tasks"
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  My Tasks
                  {myTasks.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      {myTasks.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Create Project Button - Mobile Responsive */}
              {activeView === "projects" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-2xl sm:rounded-3xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Projects View */}
        {activeView === "projects" && (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-200 shadow-xl px-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl sm:rounded-3xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No projects yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                  Create your first project to start organizing tasks and collaborating with your team
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white rounded-2xl sm:rounded-3xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-gray-100 hover:border-gray-200 shadow-xl hover:shadow-3xl transition-all duration-500 cursor-pointer hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    {/* Project Color Badge */}
                    <div className={`w-3 h-16 absolute top-8 left-0 rounded-r-2xl ${
                      index % 4 === 0 ? 'bg-gradient-to-b from-blue-500 to-blue-600' :
                      index % 4 === 1 ? 'bg-gradient-to-b from-purple-500 to-purple-600' :
                      index % 4 === 2 ? 'bg-gradient-to-b from-orange-500 to-orange-600' :
                      'bg-gradient-to-b from-green-500 to-green-600'
                    }`}></div>

                    {/* Content */}
                    <div className="relative">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-2 min-h-[3rem]">
                        {project.description || "No description provided"}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                          title="Delete project"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* My Tasks View */}
        {activeView === "tasks" && (
          <>
            {myTasks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-xl">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No tasks assigned</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You don't have any tasks assigned to you yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex-1">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.status === 'TODO' ? 'bg-gray-100 text-gray-700' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/project/${task.project?.id || task.projectId}`)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Project →
                      </button>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile-Responsive Create Project Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 sm:px-6 z-50 animate-fadeIn"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 max-w-lg w-full shadow-2xl border border-gray-200 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Create New Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 transition-colors text-gray-900 font-medium"
                  placeholder="E.g. Website Redesign"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 transition-colors h-32 resize-none text-gray-900"
                  placeholder="Brief description of what this project is about..."
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}