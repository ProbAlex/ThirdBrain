'use client';

import { useState } from 'react';
import styles from './ChatInput.module.css';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [searchToggled, setSearchToggled] = useState(false);
  const [reasoningToggled, setReasoningToggled] = useState(false);

  const handleAutoClick = () => {
    setShowOptions(!showOptions);
  };

  const handleSearchToggle = () => {
    setSearchToggled(!searchToggled);
  };

  const handleReasoningToggle = () => {
    setReasoningToggled(!reasoningToggled);
  };

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputWrapper}>
        <button className={styles.mediaButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.buttonIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
          Add Media
        </button>
        
        <div className={styles.inputField}>
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={1}
            className={styles.textInput}
          />
        </div>
        
        <button className={styles.sendButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.buttonIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
      
      <div className={styles.optionsBar}>
        <button 
          className={`${styles.autoButton} ${showOptions ? styles.autoButtonActive : ''}`}
          onClick={handleAutoClick}
        >
          Auto
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={`${styles.dropdownIcon} ${showOptions ? styles.dropdownIconActive : ''}`}
          >
            <path d="M11.47 8.47a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06l-3.22-3.22-3.22 3.22a.75.75 0 0 1-1.06-1.06l3.75-3.75Z" />
          </svg>
        </button>
        
        {showOptions && (
          <div className={styles.expandedOptions}>
            <button 
              className={`${styles.optionButton} ${searchToggled ? styles.searchActive : ''}`}
              onClick={handleSearchToggle}
            >
              Search
            </button>
            <button 
              className={`${styles.optionButton} ${reasoningToggled ? styles.reasoningActive : ''}`}
              onClick={handleReasoningToggle}
            >
              Reasoning
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
