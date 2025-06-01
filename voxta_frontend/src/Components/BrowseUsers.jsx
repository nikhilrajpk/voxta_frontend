import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, sendInterest, fetchReceivedInterests, fetchSentInterests, selectusers, selectIsAuthenticated, selectAuthLoading, selectAuthError, selectReceivedInterests, selectSentInterests, clearError } from '../store/slices/authSlice';
import { Users, Heart, AlertCircle, CheckCircle, Search, Link2, X } from 'lucide-react';

function BrowseUsers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector(selectusers);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const receivedInterests = useSelector(selectReceivedInterests);
  const sentInterests = useSelector(selectSentInterests);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch users and interests on mount
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchReceivedInterests());
    dispatch(fetchSentInterests());
    dispatch(clearError());
  }, [dispatch]);

  // Log interests for debugging
  useEffect(() => {
    console.log('Sent Interests:', sentInterests);
    console.log('Received Interests:', receivedInterests);
  }, [sentInterests, receivedInterests]);

  const handleSendInterest = async (receiverId) => {
    try {
      await dispatch(sendInterest(receiverId)).unwrap();
      dispatch(clearError());
      dispatch(fetchSentInterests()); // Refresh sent interests
    } catch (err) {
      console.error('Send interest failed:', err);
    }
  };

  // Filter users based on search query
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    return (
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Users</h1>
          <p className="text-gray-600">Connect with others by sending interest</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full p-3 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 w-full max-w-md mx-auto">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* User List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const sentInterest = sentInterests.find(interest => interest.receiver.id === user.id);
              const receivedInterest = receivedInterests.find(interest => interest.sender.id === user.id);
              const isMutual = (sentInterest && sentInterest.status.toLowerCase() === 'accepted') || 
                              (receivedInterest && receivedInterest.status.toLowerCase() === 'accepted');
              const hasSentInterest = sentInterest && sentInterest.status.toLowerCase() === 'pending';
              const isRejected = sentInterest && sentInterest.status.toLowerCase() === 'rejected';

              console.log(`User: ${user.username}, isMutual: ${isMutual}, sentInterest:`, sentInterest, 'receivedInterest:', receivedInterest);

              return (
                <div key={user.id} className="bg-white rounded-lg p-4 shadow-md">
                  <div className="flex items-center mb-4">
                    <Users className="h-8 w-8 text-emerald-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{user.email}</p>
                  <button
                    onClick={() => !isMutual && !hasSentInterest && !isRejected && handleSendInterest(user.id)}
                    disabled={loading || isMutual || hasSentInterest || isRejected}
                    className={`w-full flex items-center justify-center space-x-2 p-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 ${
                      isMutual
                        ? 'bg-blue-600 text-white cursor-not-allowed'
                        : hasSentInterest
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : isRejected
                        ? 'bg-red-500 text-white cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isMutual ? (
                      <>
                        <Link2 className="h-5 w-5" />
                        <span>Mutual Connection</span>
                      </>
                    ) : hasSentInterest ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Interest Sent</span>
                      </>
                    ) : isRejected ? (
                      <>
                        <X className="h-5 w-5" />
                        <span>Rejected</span>
                      </>
                    ) : (
                      <>
                        <Heart className="h-5 w-5" />
                        <span>Send Interest</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center">
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BrowseUsers;