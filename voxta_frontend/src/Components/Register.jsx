import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Clear Redux error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateField = (name, value, allFormData = formData) => {
    let error = '';
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (value.length > 30) {
          error = 'Username must be less than 30 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        } else if (value.length > 254) {
          error = 'Email address is too long';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        break;
      case 'confirm_password':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== allFormData.password) {
          error = 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score < 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (score < 4) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score < 5) return { strength: 3, label: 'Good', color: 'bg-blue-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: '',
      });
    }

    // Re-validate confirm_password if password changes
    if (name === 'password' && touched.confirm_password) {
      const confirmPasswordError = validateField('confirm_password', formData.confirm_password, newFormData);
      setFieldErrors(prev => ({
        ...prev,
        confirm_password: confirmPasswordError,
      }));
    }

    // Clear server error when user modifies form
    if (error) {
      dispatch(clearError());
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
      email: true,
      password: true,
      confirm_password: true,
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
        const errorMappings = {
          'User with this username already exists': 'This username is already taken. Please choose a different one.',
          'User with this email already exists': 'An account with this email already exists. Please use a different email or try logging in.',
          'Password too common': 'This password is too common. Please choose a more secure password.',
          'Password too similar to username': 'Password cannot be too similar to your username.',
          'Invalid email format': 'Please enter a valid email address.',
        };
        
        return errorMappings[data.detail] || data.detail;
      }
      
      // Handle field-specific errors
      const fieldErrors = [];
      if (data.username) {
        fieldErrors.push(`Username: ${Array.isArray(data.username) ? data.username[0] : data.username}`);
      }
      if (data.email) {
        fieldErrors.push(`Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`);
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
    }

    // Handle network and other errors
    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Invalid registration data. Please check your information and try again.';
        case 409:
          return 'An account with this username or email already exists.';
        case 429:
          return 'Too many registration attempts. Please wait a few minutes before trying again.';
        case 500:
          return 'Server error. Please try again later or contact support.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return `Registration failed (Error ${error.response.status}). Please try again.`;
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

    // Fallback for unknown errors
    return 'Registration failed. Please try again or contact support if the problem persists.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('Register formData:', formData);
    try {
      const result = await dispatch(register(formData)).unwrap();
      console.log('Register response:', result);
      localStorage.setItem('access_token', result.access); 
      localStorage.setItem('refresh_token', result.refresh); 
      dispatch(clearError());
      navigate('/');
      alert('Logged in successfully.')
    } catch (err) {
      console.error('Registration failed:', err);
      const userFriendlyError = getErrorMessage(err);
      console.log('User-friendly error:', userFriendlyError);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const hasFieldError = (field) => touched[field] && fieldErrors[field];
  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us and get started today</p>
        </div>

        {/* Registration Form */}
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
                  placeholder="Choose a username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    hasFieldError('username')
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-400'
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

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${hasFieldError('email') ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    hasFieldError('email')
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-400'
                  }`}
                  required
                />
              </div>
              {hasFieldError('email') && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.email}</span>
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
                  placeholder="Create a password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    hasFieldError('password')
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-400'
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength < 2 ? 'text-red-600' :
                      passwordStrength.strength < 3 ? 'text-yellow-600' :
                      passwordStrength.strength < 4 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              
              {hasFieldError('password') && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${hasFieldError('confirm_password') ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    hasFieldError('confirm_password')
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : formData.confirm_password && formData.confirm_password === formData.password
                      ? 'border-green-300 focus:ring-green-200 focus:border-green-400'
                      : 'border-gray-300 focus:ring-emerald-200 focus:border-emerald-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirm_password && formData.confirm_password === formData.password && !hasFieldError('confirm_password') && (
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Passwords match</span>
                </div>
              )}
              {hasFieldError('confirm_password') && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.confirm_password}</span>
                </div>
              )}
            </div>

            {/* Server Error */}
            {error && (
              <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium">Username/Email already exist</p>
                  <p className="text-red-600 text-sm mt-1">{getErrorMessage(error)}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/"
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;