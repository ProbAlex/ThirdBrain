'use client';

import React from 'react';
import styles from './ChatHistory.module.css';
import { useMessages } from '../../store/MessageContext';

// Helper function to format timestamp to time ago string
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};

const ChatHistory: React.FC = () => {
  const { 
    sessions, 
    activeSessionId, 
    switchSession, 
    createNewSession, 
    deleteSession 
  } = useMessages();

  const handleSessionClick = (sessionId: string) => {
    switchSession(sessionId);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  return (
    <div className={styles.chatHistoryContainer}>
      <div className={styles.historyHeader}>
        <h2>Chat History</h2>
      </div>
      <div className={styles.chatList}>
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className={`${styles.chatItem} ${session.id === activeSessionId ? styles.active : ''}`}
            onClick={() => handleSessionClick(session.id)}
          >
            <div className={styles.chatTitle}>{session.title}</div>
            <div className={styles.chatControls}>
              <div className={styles.chatTimestamp}>
                {formatTimeAgo(session.lastUpdated)}
              </div>
              <button 
                className={styles.deleteButton}
                onClick={(e) => handleDeleteSession(e, session.id)}
                title="Delete chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={styles.deleteIcon}>
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
