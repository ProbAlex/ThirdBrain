'use client';

import { useState } from 'react';
import { MessageProvider } from '../store/MessageContext';
import Header from './components/Header';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import styles from './page.module.css';

export default function ChatPage() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(300); // Default width
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newWidth = e.clientX;
    setLeftPanelWidth(Math.max(200, Math.min(500, newWidth)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <MessageProvider>
      <div className={styles.container}>
        <div className={styles.headerBar}>
          <Header />
        </div>
        <div className={styles.contentContainer}>
          <div 
            className={styles.leftPanel} 
            style={{ width: `${leftPanelWidth}px` }}
          >
            <ChatHistory />
          </div>
          <div 
            className={styles.resizeHandle}
            onMouseDown={handleMouseDown}
            style={{ left: `${leftPanelWidth}px` }}
          />
          <div className={styles.rightPanel} style={{ marginLeft: `${leftPanelWidth}px` }}>
            <div className={styles.chatContainer}>
              <ChatMessages />
              <ChatInput />
            </div>
          </div>
        </div>
      </div>
    </MessageProvider>
  );
}
