import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Components (from your components barrel)
import { Navigation, Sidebar, Footer, Login, ProtectedRoute } from "./components";

// Pages (from your pages barrel)
import { Home, Interns, InternProfile, Teams, TeamProfile, Projects, ProjectProfile, QA, AddBulkData } from "./pages";

// Standalone pages (not in the barrel)
import DevOps from "./pages/DevOps/DevOps";
import InternUpdateRequests from "./pages/InternUpdateRequests/InternUpdateRequests";

import "./App.css";

const AppContent = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarVisible(v => !v);
  const closeSidebar = () => setIsSidebarVisible(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarVisible(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app">
      <Navigation onMenuClick={toggleSidebar} />
      <Sidebar isVisible={isSidebarVisible} onClose={closeSidebar} />

      <main className="main-content">
        <Routes>
          {/* Root redirect based on role */}
          <Route
            path="/"
            element={
              isAdmin ? (
                <ProtectedRoute adminOnly={true}>
                  <Home />
                </ProtectedRoute>
              ) : (
                <Navigate to="/profile" replace />
              )
            }
          />

          {/* Admin — Interns list */}
          <Route
            path="/interns"
            element={
              <ProtectedRoute adminOnly={true}>
                <Interns />
              </ProtectedRoute>
            }
          />

          {/* Admin — Pending update approvals */}
          <Route
            path="/intern-update-requests"
            element={
              <ProtectedRoute adminOnly={true}>
                <InternUpdateRequests />
              </ProtectedRoute>
            }
          />

          {/* Admin — DevOps track */}
          <Route
            path="/devops"
            element={
              <ProtectedRoute adminOnly={true}>
                <DevOps />
              </ProtectedRoute>
            }
          />

          {/* Admin — QA track */}
          <Route
            path="/qa"
            element={
              <ProtectedRoute adminOnly={true}>
                <QA />
              </ProtectedRoute>
            }
          />

          {/* Intern — My profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute internOnly={true}>
                <InternProfile />
              </ProtectedRoute>
            }
          />

          {/* Shared — View specific intern profile */}
          <Route
            path="/interns/:id"
            element={
              <ProtectedRoute>
                <InternProfile />
              </ProtectedRoute>
            }
          />

          {/* Teams */}
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:id"
            element={
              <ProtectedRoute>
                <TeamProfile />
              </ProtectedRoute>
            }
          />

          {/* Projects */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin — Bulk import */}
          <Route
            path="/add-bulk-data"
            element={
              <ProtectedRoute adminOnly={true}>
                <AddBulkData />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* If you want a footer, uncomment this: */}
      {/* <Footer /> */}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
