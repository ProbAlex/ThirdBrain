'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message as ApiMessage, createChatCompletion } from '../services/api';
import { Message, ChatSession } from '../types';
import { getCookie, setCookie } from '../utils/cookies';

interface MessageContextType {
  activeSessionId: string;
  sessions: ChatSession[];
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  currentStreamedMessage: string;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  createNewSession: () => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

interface MessageProviderProps {
  children: ReactNode;
}

const SYSTEM_MESSAGE: Message = {
  role: 'system',
  content: 'You are 3rd Brain, a helpful assistant with expertise in various topics. Provide concise, accurate and helpful responses.',
  timestamp: Date.now(),
};

const CHAT_SESSIONS_COOKIE = '3rdBrain_chatSessions';

// Create a new empty chat session
const createEmptySession = (): ChatSession => ({
  id: uuidv4(),
  title: 'New Conversation',
  messages: [SYSTEM_MESSAGE],
  lastUpdated: Date.now(),
});

// Create the context with default values
const MessageContext = createContext<MessageContextType>({
  activeSessionId: '',
  sessions: [],
  messages: [],
  isLoading: false,
  isStreaming: false,
  currentStreamedMessage: '',
  sendMessage: async () => {},
  clearMessages: () => {},
  createNewSession: () => {},
  switchSession: () => {},
  deleteSession: () => {},
});

// Custom hook to use the message context
export const useMessages = () => useContext(MessageContext);

// Provider component
export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Initialize sessions from cookies on component mount
  useEffect(() => {
    const initializeSessions = () => {
      try {
        console.log('Loading sessions from cookies');
        const sessionsJson = getCookie(CHAT_SESSIONS_COOKIE);
        console.log('Cookie value:', sessionsJson);
        
        if (sessionsJson) {
          const savedSessions: ChatSession[] = JSON.parse(sessionsJson);
          console.log('Parsed sessions:', savedSessions);
          
          if (savedSessions && Array.isArray(savedSessions) && savedSessions.length > 0) {
            setSessions(savedSessions);
            setActiveSessionId(savedSessions[0].id);
            return;
          }
        }
        
        // If no sessions exist, create a new one
        const newSession = createEmptySession();
        console.log('Created new session:', newSession);
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        const newSession = createEmptySession();
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      }
    };

    initializeSessions();
  }, []);

  // Save sessions to cookies whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      console.log('Saving sessions to cookies:', sessions);
      const sessionsToSave = sessions.map(session => ({
        ...session,
        // Ensure we're not saving empty assistant messages that might be mid-conversation
        messages: session.messages.filter(msg => !(msg.role === 'assistant' && msg.content === ''))
      }));
      setCookie(CHAT_SESSIONS_COOKIE, JSON.stringify(sessionsToSave));
    }
  }, [sessions]);

  // Get the active session
  const activeSession = sessions.find(session => session.id === activeSessionId) || sessions[0];
  
  // Get messages from the active session
  const messages = activeSession?.messages || [];

  // Function to update a session
  const updateSession = (sessionId: string, updater: (session: ChatSession) => ChatSession) => {
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === sessionId ? updater(session) : session
      )
    );
  };

  // Function to generate a title for a chat
  const generateTitle = (messages: Message[]): string => {
    // Find the first user message
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) return 'New Conversation';
    
    // Use first few words from the user's first message
    const words = firstUserMessage.content.split(' ');
    const title = words.slice(0, 5).join(' ');
    return title.length > 30 ? title.substring(0, 30) + '...' : title;
  };

  // Function to handle streaming chunks
  const handleStreamChunk = (chunk: string) => {
    setCurrentStreamedMessage((prev) => prev + chunk);
  };

  // Function to send a message and get a response
  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeSession) return;

    console.log('Sending message in session:', activeSession.id);
    
    // Create the new user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setIsLoading(true);
    setCurrentStreamedMessage(''); // Reset streamed message
    
    let currentSessionRef = {...activeSession};

    // First, add just the user message
    currentSessionRef = {
      ...currentSessionRef,
      messages: [...currentSessionRef.messages, userMessage],
      lastUpdated: Date.now(),
      title: currentSessionRef.messages.length <= 1 
        ? generateTitle([...currentSessionRef.messages, userMessage]) 
        : currentSessionRef.title
    };
    
    // Update the session with the user message
    setSessions(prev => 
      prev.map(session => 
        session.id === activeSession.id ? currentSessionRef : session
      )
    );
    
    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Now prepare for streaming
    setIsStreaming(true);
    
    try {      
      // Get the messages to send to the API
      const messagesToSend = [...currentSessionRef.messages];
      
      const apiMessages: ApiMessage[] = messagesToSend.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      
      console.log('Sending messages to API:', JSON.stringify(apiMessages));
      
      // Make API request with streaming
      const { response } = await createChatCompletion(
        apiMessages,
        handleStreamChunk
      );

      // Create assistant response message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      
      // Add assistant response to the session
      updateSession(activeSession.id, (session) => {
        // Get current messages excluding any empty assistant messages
        const currentMessages = session.messages.filter(
          msg => !(msg.role === 'assistant' && msg.content === '')
        );
          
        return {
          ...session,
          messages: [...currentMessages, assistantMessage],
          lastUpdated: Date.now()
        };
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update with error message
      updateSession(activeSession.id, (session) => {
        const updatedMessages = [...session.messages];
        if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].role === 'assistant') {
          updatedMessages[updatedMessages.length - 1] = {
            role: 'assistant',
            content: 'I apologize, but I encountered an error. Please try again later.',
            timestamp: Date.now(),
          };
        }

        return {
          ...session,
          messages: updatedMessages,
          lastUpdated: Date.now()
        };
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setCurrentStreamedMessage('');
    }
  };

  // Function to create a new chat session
  const createNewSession = () => {
    const newSession = createEmptySession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Function to switch to a different chat session
  const switchSession = (sessionId: string) => {
    if (sessions.some(session => session.id === sessionId)) {
      setActiveSessionId(sessionId);
    }
  };

  // Function to delete a chat session
  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    // If we're deleting the active session, switch to another one
    if (activeSessionId === sessionId && sessions.length > 1) {
      const remainingSessions = sessions.filter(session => session.id !== sessionId);
      setActiveSessionId(remainingSessions[0].id);
    } else if (sessions.length <= 1) {
      // If this was the last session, create a new one
      createNewSession();
    }
  };

  // Function to clear messages in active session but keep the session
  const clearMessages = () => {
    if (activeSession) {
      updateSession(activeSession.id, (session) => ({
        ...session,
        messages: [SYSTEM_MESSAGE],
        title: 'New Conversation',
        lastUpdated: Date.now()
      }));
    } else {
      createNewSession();
    }
  };

  // Create the context value
  const contextValue: MessageContextType = {
    activeSessionId,
    sessions,
    messages,
    isLoading,
    isStreaming,
    currentStreamedMessage,
    sendMessage,
    clearMessages,
    createNewSession,
    switchSession,
    deleteSession
  };

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
};
