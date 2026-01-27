import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PrivateRoute from './components/Auth/PrivateRoute';
import './index.css';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const MyFoods = lazy(() => import('./pages/MyFoods'));
const SavedMeals = lazy(() => import('./pages/SavedMeals'));
const Progress = lazy(() => import('./pages/Progress'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Community = lazy(() => import('./pages/Community'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-screen" style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    fontSize: '18px'
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Dashboard />
                  </Suspense>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/foods"
            element={
              <PrivateRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <MyFoods />
                  </Suspense>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <PrivateRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <SavedMeals />
                  </Suspense>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/community"
            element={
              <PrivateRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Community />
                  </Suspense>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/community/:recipeId"
            element={
              <PrivateRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <RecipeDetail />
                  </Suspense>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <PrivateRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Progress />
                  </Suspense>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Profile />
                  </Suspense>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Settings />
                  </Suspense>
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
