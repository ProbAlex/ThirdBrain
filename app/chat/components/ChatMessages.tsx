'use client';

import React, { useRef, useEffect } from 'react';
import { useMessages } from '../../store/MessageContext';
import styles from './ChatMessages.module.css';

const ChatMessages = () => {
  const { messages, isLoading, isStreaming, currentStreamedMessage } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or streaming text updates
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    
    scrollToBottom();
    
    // Add a small delay to ensure scroll happens after rendering
    const timer = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timer);
  }, [messages, currentStreamedMessage]);

  // Format timestamp to readable time
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Display all messages except system messages and empty assistant messages
  const displayMessages = messages
    .filter(msg => msg.role !== 'system')
    .filter(msg => !(msg.role === 'assistant' && msg.content === ''));

  return (
    <div className={styles.messagesContainer}>
      {/* Display messages */}
      {displayMessages.map((message, index) => (
        <div 
          key={index} 
          className={`${styles.messageWrapper} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
        >
          <div className={styles.messageBubble}>
            <div className={styles.messageContent}>{message.content}</div>
            <div className={styles.messageTime}>{formatTime(message.timestamp)}</div>
          </div>
        </div>
      ))}
      
      {/* Streaming message */}
      {isStreaming && currentStreamedMessage && (
        <div className={`${styles.messageWrapper} ${styles.assistantMessage}`}>
          <div className={styles.messageBubble}>
            <div className={styles.messageContent}>{currentStreamedMessage}</div>
            <div className={styles.streamingIndicator}>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator (only show if loading but not yet streaming) */}
      {isLoading && !isStreaming && (
        <div className={`${styles.messageWrapper} ${styles.assistantMessage}`}>
          <div className={styles.messageBubble}>
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      
      {/* Extra padding for scrolling all the way down */}
      <div style={{ height: '50px' }} />
      
      {/* Invisible div for auto-scrolling */}
      <div ref={messagesEndRef} className={styles.scrollAnchor} />
    </div>
  );
};

export default ChatMessages;
