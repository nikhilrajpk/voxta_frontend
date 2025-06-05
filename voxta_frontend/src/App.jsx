import { useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth, selectAuthLoading, selectIsAuthenticated } from './store/slices/authSlice';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

const Login = lazy(()=> import('./Components/Login'))
const Dashboard = lazy(()=> import('./Components/Dashboard'))
const Register = lazy(()=> import('./Components/Register'))
const BrowseUsers = lazy(()=> import('./Components/BrowseUsers'))
const Interests = lazy(()=> import('./Components/Interests'))
const Chat = lazy(() => import('./Components/Chat'))
import LoadingSpinners from './utils/Loader';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Suspense fallback={<LoadingSpinners/>}>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-emerald-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">Voxta</Link>
            <div className="space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                  <Link to="/browse" className="hover:underline">Browse Users</Link>
                  <Link to="/interests" className="hover:underline">Interests</Link>
                  <Link to="/chat" className="hover:underline">Chat</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:underline">Login</Link>
                  <Link to="/register" className="hover:underline">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={'/chat'} /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to={'/dashboard'} /> : <Register />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to={'/login'} />} />
          <Route path="/browse" element={isAuthenticated ? <BrowseUsers /> : <Navigate to={'/login'}/>} />
          <Route path="/interests" element={isAuthenticated ? <Interests /> : <Navigate to={'/login'}/>} />
          <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to={'/login'}/>} />
          
        </Routes>
      </div>
    </Suspense>
  );
}

export default App;