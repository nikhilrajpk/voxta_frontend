import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceivedInterests, updateInterest, selectReceivedInterests, selectIsAuthenticated, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';
import { Check, X, AlertCircle } from 'lucide-react';

function Interests() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const receivedInterests = useSelector(selectReceivedInterests);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
    dispatch(fetchReceivedInterests());
    dispatch(clearError());
  }, [dispatch, isAuthenticated, navigate]);

  const handleAction = async (interestId, action) => {
    try {
      await dispatch(updateInterest({ id: interestId, action })).unwrap();
      dispatch(clearError());
    } catch (err) {
      console.error(`Failed to ${action} interest:`, err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Received Interests</h1>
          <p className="text-gray-600">Manage incoming connection requests</p>
        </div>

        {error && (
          <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 w-full max-w-md mx-auto">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading interests...</p>
            </div>
          ) : receivedInterests.length > 0 ? (
            receivedInterests.map((interest) => (
              <div key={interest.id} className="bg-white rounded-2xl p-6 shadow-xl flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{interest.sender.username}</h2>
                  <p className="text-gray-600 text-sm">Email: {interest.sender.email}</p>
                  <p className="text-gray-500 text-xs">Sent: {new Date(interest.created_at).toLocaleString()}</p>
                  <p className="text-gray-600 text-sm">Status: {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}</p>
                </div>
                {interest.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAction(interest.id, 'accept')}
                      className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      title="Accept"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleAction(interest.id, 'reject')}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                      title="Reject"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center">
              <p className="text-gray-600">No interests received</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interests;