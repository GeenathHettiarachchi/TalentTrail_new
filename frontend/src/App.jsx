import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation, Sidebar, Footer, Login, ProtectedRoute } from './components';
import { Home, Interns, InternProfile, Teams, TeamProfile, Projects, ProjectProfile, DevOps, QA, AddBulkData } from './pages';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, isAdmin, isIntern, loading } = useAuth();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const closeSidebar = () => {
    setIsSidebarVisible(false);
  };

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarVisible(false);
  }, [window.location.pathname]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
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
          {/* Redirect root path based on user role */}
          <Route path="/" element={
            isAdmin ? (
              <ProtectedRoute adminOnly={true}>
                <Home />
              </ProtectedRoute>
            ) : (
              <Navigate to="/profile" replace />
            )
          } />
          
          {/* Admin routes */}
          <Route path="/interns" element={
            <ProtectedRoute adminOnly={true}>
              <Interns />
            </ProtectedRoute>
          } />
          
          <Route path="/devops" element={
            <ProtectedRoute adminOnly={true}>
              <DevOps />
            </ProtectedRoute>
          } />
          
          <Route path="/qa" element={
            <ProtectedRoute adminOnly={true}>
              <QA />
            </ProtectedRoute>
          } />
          
          {/* Intern profile route - redirect to their own profile */}
          <Route path="/profile" element={
            <ProtectedRoute internOnly={true}>
              <InternProfile />
            </ProtectedRoute>
          } />
          
          {/* Specific intern/team/project profile routes */}
          <Route path="/interns/:id" element={
            <ProtectedRoute>
              <InternProfile />
            </ProtectedRoute>
          } />
          <Route path="/teams" element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          } />
          <Route path="/teams/:id" element={
            <ProtectedRoute>
              <TeamProfile />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <ProjectProfile />
            </ProtectedRoute>
          } />
          <Route path="/add-bulk-data" element={
            <ProtectedRoute adminOnly={true}>
              <AddBulkData />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
