import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchConnectedUsers, 
  fetchMessageHistory, 
  selectConnectedUsers, 
  selectMessages, 
  selectIsAuthenticated, 
  selectUser,
  selectAuthLoading,
  addMessage
} from '../store/slices/authSlice';
import { Send, Users, MessageCircle, AlertCircle } from 'lucide-react';

function Chat() {
  const dispatch = useDispatch();
  const connectedUsers = useSelector(selectConnectedUsers);
  const messages = useSelector(selectMessages);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [error, setError] = useState('');
  const [unreadMessages, setUnreadMessages] = useState({});
  const [lastReadMessages, setLastReadMessages] = useState({});
  const [processedMessageIds, setProcessedMessageIds] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef({});
  const reconnectTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(fetchConnectedUsers()).then(() => {
      connectedUsers.forEach(user => {
        dispatch(fetchMessageHistory(user.id));
      });
    });

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!currentUser || !isAuthenticated) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }

    const connectWebSocket = () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected, skipping reconnect');
        return;
      }

      if (socketRef.current) {
        console.log('Closing existing WebSocket before reconnecting');
        socketRef.current.close(1000, 'Reconnecting');
        socketRef.current = null;
      }

      const wsUrl = `wss://voxta-service-949877042975.us-central1.run.app/ws/chat/?token=${token}`;
      console.log('Connecting to WebSocket:', wsUrl);
      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setError('');
        clearTimeout(reconnectTimeoutRef.current);
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      newSocket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        socketRef.current = null;
        if (event.code === 1006) {
          setError('Connection failed. Retrying...');
          attemptReconnect();
        } else if (event.code !== 1000) {
          setError('Connection lost. Retrying...');
          attemptReconnect();
        }
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
        setIsConnected(false);
      };

      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    const attemptReconnect = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        connectWebSocket();
      }, 3000);
    };

    connectWebSocket();

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'connection_established':
        console.log('Chat connection established:', data.message);
        break;
      
      case 'message_received':
        console.log('Message received:', data.message);
        if (data.message?.sender?.id && data.message?.receiver?.id && !processedMessageIds.has(data.message.id)) {
          setProcessedMessageIds(prev => new Set([...prev, data.message.id]));
          const otherUserId = data.message.sender.id === currentUser?.id 
            ? data.message.receiver.id 
            : data.message.sender.id;
          
          dispatch(addMessage({
            userId: otherUserId,
            message: data.message
          }));

          // Only add pulse if not in the sender's chat and message is from another user
          if (data.message.sender.id !== currentUser?.id && (!selectedUser || selectedUser.id !== otherUserId)) {
            setUnreadMessages(prev => ({
              ...prev,
              [otherUserId]: (prev[otherUserId] || 0) + 1
            }));
          }
        }
        break;
      
      case 'message_sent':
        console.log('Message sent confirmation:', data.message);
        if (data.message?.id && !processedMessageIds.has(data.message.id)) {
          setProcessedMessageIds(prev => new Set([...prev, data.message.id]));
        }
        break;
      
      case 'typing_indicator':
        handleTypingIndicator(data);
        break;
      
      case 'error':
        console.error('WebSocket error:', data.error);
        setError(data.error);
        break;
      
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const handleTypingIndicator = (data) => {
    const { sender_id, is_typing } = data;
    
    setTypingUsers(prev => {
      const updated = { ...prev };
      if (is_typing) {
        updated[sender_id] = true;
        if (typingTimeoutRef.current[sender_id]) {
          clearTimeout(typingTimeoutRef.current[sender_id]);
        }
        typingTimeoutRef.current[sender_id] = setTimeout(() => {
          setTypingUsers(prev => {
            const { [sender_id]: removed, ...rest } = prev;
            return rest;
          });
        }, 3000);
      } else {
        delete updated[sender_id];
        if (typingTimeoutRef.current[sender_id]) {
          clearTimeout(typingTimeoutRef.current[sender_id]);
          delete typingTimeoutRef.current[sender_id];
        }
      }
      return updated;
    });
  };

  const selectUserChat = async (user) => {
    setSelectedUser(user);
    setError('');

    const userMessages = messages[user.id] || [];
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      setLastReadMessages(prev => ({
        ...prev,
        [user.id]: lastMessage.id
      }));
    }
    
    setUnreadMessages(prev => {
      const updated = { ...prev };
      delete updated[user.id];
      return updated;
    });

    dispatch(fetchMessageHistory(user.id));
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedUser || !socket || !isConnected) {
      console.log('Cannot send message:', {
        hasMessage: !!messageInput.trim(),
        hasSelectedUser: !!selectedUser,
        hasSocket: !!socket,
        isConnected
      });
      return;
    }

    const messageContent = messageInput.trim();
    const messageData = {
      type: 'chat_message',
      receiver_id: selectedUser.id,
      content: messageContent
    };

    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      sender: {
        id: currentUser.id,
        username: currentUser.username
      },
      receiver: {
        id: selectedUser.id,
        username: selectedUser.username
      },
      timestamp: new Date().toISOString(),
      is_optimistic: true
    };

    dispatch(addMessage({
      userId: selectedUser.id,
      message: optimisticMessage
    }));

    console.log('Sending message:', messageData);
    socket.send(JSON.stringify(messageData));
    setMessageInput('');
    
    sendTypingIndicator(false);
  };

  const sendTypingIndicator = (isTyping) => {
    if (!selectedUser || !socket || !isConnected) return;

    const typingData = {
      type: 'typing_indicator',
      receiver_id: selectedUser.id,
      is_typing: isTyping
    };

    socket.send(JSON.stringify(typingData));
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    sendTypingIndicator(true);
    
    if (typingTimeoutRef.current.own) {
      clearTimeout(typingTimeoutRef.current.own);
    }
    
    typingTimeoutRef.current.own = setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentMessages = selectedUser ? messages[selectedUser.id] || [] : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Please login to access chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <div className="w-1/4 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        <div className="p-4 bg-indigo-600 text-white">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Connected Users</h2>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm">{isConnected ? 'Online' : 'Offline'}</span>
          </div>
          {currentUser && (
            <div className="mt-1 text-sm opacity-75">
              Logged in as: {currentUser.username}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 text-sm mt-2">Loading users...</p>
            </div>
          ) : connectedUsers.length > 0 ? (
            <div className="p-2">
              {connectedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => selectUserChat(user)}
                  className={`p-3 m-1 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedUser?.id === user.id
                      ? 'bg-indigo-100 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {unreadMessages[user.id] > 0 && (
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    {typingUsers[user.id] && (
                      <div className="text-xs text-indigo-600 font-medium">typing...</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-600">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No connected users</p>
              <p className="text-sm mt-1">Send interests to other users to start chatting</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="bg-white shadow-sm border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedUser.username}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-scroll p-4 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender.id === currentUser?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender.id === currentUser?.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white shadow-md border border-gray-200'
                      } ${message.is_optimistic ? 'opacity-100' : ''}`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender.id === currentUser?.id
                            ? 'text-indigo-200'
                            : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {typingUsers[selectedUser.id] && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Message ${selectedUser.username}...`}
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={!isConnected}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                  className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              {!isConnected && (
                <p className="text-sm text-red-600 mt-2">
                  Connection lost. Please refresh the page to reconnect.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a connected user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;