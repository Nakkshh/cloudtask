import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-xl border-b border-gray-200">
        <div className="w-full px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-black text-gray-900">⏰ CloudTask</div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Welcome to CloudTask! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            You're logged in as: <span className="font-semibold text-gray-900">{user?.email}</span>
          </p>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <p className="text-gray-700">
              🚀 <strong>Next Phase:</strong> Connect this to Spring Boot backend for task management!
            </p>
          </div>
        </div>

        {/* Task Section Placeholder */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Tasks</h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-4">📋 No tasks yet</p>
            <p className="text-sm">Backend integration coming in Phase 3!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
