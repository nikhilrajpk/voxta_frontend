import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../API/authApi';

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.checkAuth();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Authentication check failed'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Registration failed'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Login failed'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.logout();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Logout failed'
      );
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'auth/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const sendInterest = createAsyncThunk(
  'auth/sendInterest',
  async (receiverId, { rejectWithValue }) => {
    try {
      const response = await authApi.sendInterest(receiverId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to send interest'
      );
    }
  }
);

export const fetchReceivedInterests = createAsyncThunk(
  'auth/fetchReceivedInterests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getReceivedInterests();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch interests'
      );
    }
  }
);

export const fetchSentInterests = createAsyncThunk(
  'auth/fetchSentInterests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getSentInterests();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch sent interests'
      );
    }
  }
);

export const updateInterest = createAsyncThunk(
  'auth/updateInterest',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const response = await authApi.updateInterest(id, action);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || `Failed to ${action} interest`
      );
    }
  }
);

export const fetchConnectedUsers = createAsyncThunk(
    'auth/fetchConnectedUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authApi.getConnectedUsers();
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch connected users'
            );
        }
    }
);

export const fetchMessageHistory = createAsyncThunk(
    'auth/fetchMessageHistory',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await authApi.getMessageHistory(userId);
            return { userId, messages: response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch message history'
            );
        }
    }
);


export const initialState = {
  user: null,
  isAuthenticated: false,
  error: null,
  loading: false,
  users: [],
  receivedInterests: [],
  sentInterests: [],
  connectedUsers: [],
  messages: {},
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Add message to state without API call for real-time updates
    addMessage: (state, action) => {
      const { userId, message } = action.payload;
      if (!state.messages[userId]) {
        state.messages[userId] = [];
      }
      // Check if message already exists to avoid duplicates
      const messageExists = state.messages[userId].some(msg => msg.id === message.id);
      if (!messageExists) {
        state.messages[userId].push(message);
        // Sort by timestamp to maintain order
        state.messages[userId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user = action.payload;  // User data is at root level
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user = action.payload.user;  // User data is nested under 'user'
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.users = [];
        state.receivedInterests = [];
        state.messages = {};
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.users = [];
        state.receivedInterests = [];
        state.messages = {};
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendInterest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendInterest.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(sendInterest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchReceivedInterests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceivedInterests.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.receivedInterests = action.payload;
      })
      .addCase(fetchReceivedInterests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSentInterests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSentInterests.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.sentInterests = action.payload;
      })
      .addCase(fetchSentInterests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateInterest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInterest.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Update receivedInterests with the updated interest
        state.receivedInterests = state.receivedInterests.map(interest =>
          interest.id === action.payload.id ? action.payload : interest
        );
      })
      .addCase(updateInterest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchConnectedUsers.pending, (state) => {
          state.loading = true;
          state.error = null;
      })
      .addCase(fetchConnectedUsers.fulfilled, (state, action) => {
          state.loading = false;
          state.error = null;
          state.connectedUsers = action.payload;
      })
      .addCase(fetchConnectedUsers.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      })
      .addCase(fetchMessageHistory.pending, (state) => {
          state.error = null;
      })
      .addCase(fetchMessageHistory.fulfilled, (state, action) => {
          state.loading = false;
          state.error = null;
          state.messages[action.payload.userId] = action.payload.messages;
      })
      .addCase(fetchMessageHistory.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
export const { clearError, addMessage } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectusers = (state) => state.auth.users;
export const selectReceivedInterests = (state) => state.auth.receivedInterests;
export const selectSentInterests = (state) => state.auth.sentInterests;
export const selectConnectedUsers = (state) => state.auth.connectedUsers;
export const selectMessages = (state) => state.auth.messages;