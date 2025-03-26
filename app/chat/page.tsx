'use client';

import { useState } from 'react';
import Header from './components/Header';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
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
    <div className={styles.container}>
      <div 
        className={styles.leftPanel} 
        style={{ width: `${leftPanelWidth}px` }}
      >
        <Header />
        <ChatHistory />
      </div>
      <div 
        className={styles.resizeHandle}
        onMouseDown={handleMouseDown}
      />
      <div className={styles.rightPanel} style={{ marginLeft: `${leftPanelWidth}px` }}>
        <div className={styles.chatContainer}>
          <div className={styles.chatMessages}>
            {/* Chat messages will go here */}
          </div>
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
