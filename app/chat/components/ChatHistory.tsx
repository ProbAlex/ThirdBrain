'use client';

import React from 'react';
import styles from './ChatHistory.module.css';

// Mock data for chat history
const mockChatHistory = [
  { id: 1, title: 'AI Advancements Discussion', timestamp: Date.now() - 1000 * 60 * 30 }, // 30 minutes ago
  { id: 2, title: 'Project Planning', timestamp: Date.now() - 1000 * 60 * 60 * 2 }, // 2 hours ago
  { id: 3, title: 'Creative Writing Ideas', timestamp: Date.now() - 1000 * 60 * 60 * 24 }, // 1 day ago
  { id: 4, title: 'Research on Quantum Computing', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2 }, // 2 days ago
  { id: 5, title: 'Movie Recommendations', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5 }, // 5 days ago
  { id: 6, title: 'Travel Planning', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7 }, // 1 week ago
  { id: 7, title: 'Coding Tips', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14 }, // 2 weeks ago
  { id: 8, title: 'Book Summaries', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30 }, // 1 month ago
];

const ChatHistory = () => {
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className={styles.chatHistoryContainer}>
      <div className={styles.historyHeader}>
        <h2>Chat History</h2>
      </div>
      <div className={styles.chatList}>
        {mockChatHistory.map((chat) => (
          <div key={chat.id} className={styles.chatItem}>
            <div className={styles.chatTitle}>{chat.title}</div>
            <div className={styles.chatTimestamp}>{formatTimeAgo(chat.timestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
