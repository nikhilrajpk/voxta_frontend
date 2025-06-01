import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [displayError, setDisplayError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Clear Redux error when component mounts
  useEffect(() => {
    dispatch(clearError());
    setDisplayError('');
  }, [dispatch]);

  // Update display error when Redux error changes
  useEffect(() => {
    if (error) {
      setDisplayError(getErrorMessage(error));
    } else {
      setDisplayError('');
    }
  }, [error]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: '',
      });
    }

    // Clear server error when user modifies form
    if (error || displayError) {
      dispatch(clearError());
      setDisplayError('');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    const fieldError = validateField(name, value);
    setFieldErrors({
      ...fieldErrors,
      [name]: fieldError,
    });
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key]);
      if (fieldError) errors[key] = fieldError;
    });
    
    setFieldErrors(errors);
    setTouched({
      username: true,
      password: true,
    });
    
    return Object.keys(errors).length === 0;
  };

  const getErrorMessage = (error) => {
    // Handle different types of errors
    if (typeof error === 'string') {
      return error;
    }

    // Handle axios/API errors with response data
    if (error?.response?.data) {
      const { data } = error.response;
      
      // Handle specific error messages from backend
      if (data.detail) {
        // Common backend error messages and their user-friendly versions
        const errorMappings = {
          'No active account found with the given credentials': 'Invalid username or password. Please check your credentials and try again.',
          'Invalid credentials': 'Invalid username or password. Please check your credentials and try again.',
          'Unable to log in with provided credentials.': 'Invalid username or password. Please check your credentials and try again.',
          'Account is not verified': 'Your account needs to be verified. Please check your email for verification instructions.',
          'Account is disabled': 'Your account has been disabled. Please contact support for assistance.',
          'Account is inactive': 'Your account is inactive. Please contact support for assistance.',
          'Too many failed login attempts': 'Too many failed attempts. Please try again after some time.',
          'User account is locked': 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.',
        };
        
        return errorMappings[data.detail] || data.detail;
      }
      
      // Handle field-specific errors
      const fieldErrors = [];
      if (data.username) {
        fieldErrors.push(`Username: ${Array.isArray(data.username) ? data.username[0] : data.username}`);
      }
      if (data.password) {
        fieldErrors.push(`Password: ${Array.isArray(data.password) ? data.password[0] : data.password}`);
      }
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join('. ');
      }
      
      // Handle non_field_errors
      if (data.non_field_errors) {
        return Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
      }

      // Handle generic error messages
      if (data.error) {
        return data.error;
      }

      if (data.message) {
        return data.message;
      }
    }

    // Handle network and other errors
    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Invalid login data. Please check your username and password.';
        case 401:
          return 'Invalid username or password. Please check your credentials and try again.';
        case 403:
          return 'Access forbidden. Your account may be suspended or you may not have permission to access this resource.';
        case 404:
          return 'Login service not found. Please contact support.';
        case 429:
          return 'Too many login attempts. Please wait a few minutes before trying again.';
        case 500:
          return 'Server error. Please try again later or contact support.';
        case 502:
          return 'Service unavailable. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        case 504:
          return 'Request timed out. Please try again.';
        default:
          return `Login failed (Error ${error.response.status}). Please try again.`;
      }
    }

    // Handle network errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    // Handle timeout errors
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }

    // Handle connection refused
    if (error?.code === 'ECONNREFUSED') {
      return 'Unable to connect to the server. Please try again later.';
    }

    // Fallback for unknown errors
    return 'Login failed. Please try again or contact support if the problem persists.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setDisplayError('');
    console.log('Login formData:', formData);
    try {
      const result = await dispatch(login(formData)).unwrap();
      console.log('Login response:', result);
      localStorage.setItem('access_token', result.access);
      localStorage.setItem('refresh_token', result.refresh);
      dispatch(clearError());
      setDisplayError('');
      navigate('/dashboard/');
    } catch (err) {
      console.error('Login failed:', err);
      const userFriendlyError = getErrorMessage(err);
      setDisplayError(userFriendlyError);
      console.log('User-friendly error:', userFriendlyError);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const hasFieldError = (field) => touched[field] && fieldErrors[field];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Please sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${hasFieldError('username') ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    hasFieldError('username')
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                  }`}
                  required
                />
              </div>
              {hasFieldError('username') && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.username}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${hasFieldError('password') ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    hasFieldError('password')
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {hasFieldError('password') && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Server Error */}
            {(error || displayError) && (
              <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-600 text-sm">Invalid Credentials</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register/"
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;