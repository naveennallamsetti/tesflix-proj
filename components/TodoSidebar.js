'use client';

import { useState, useEffect } from 'react';
import styles from './TodoSidebar.module.css';

export default function TodoSidebar({ isOpen, onClose }) {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTodos();
    }
  }, [isOpen]);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        setTodos([]);
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      setTodos([]);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const newTodo = await res.json();
      setTodos([newTodo, ...todos]);
      setInputText('');
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    // Optimistic update
    setTodos(todos.map(t => t.id === id ? { ...t, isDone: !currentStatus } : t));
    
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone: !currentStatus }),
      });
    } catch (error) {
      // Revert if failed
      setTodos(todos.map(t => t.id === id ? { ...t, isDone: currentStatus } : t));
    }
  };

  const deleteTodo = async (id) => {
    setTodos(todos.filter(t => t.id !== id));
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    } catch (error) {
      fetchTodos(); // Refetch if failed
    }
  };

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} 
        onClick={onClose}
      />
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <h2>My Tasks</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <form className={styles.inputContainer} onSubmit={addTodo}>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="What do you need to watch?"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className={styles.addButton}>Add</button>
        </form>

        <div className={styles.todoList}>
          {todos.map((todo) => (
            <div key={todo.id} className={styles.todoItem}>
              <div className={styles.todoLeft} onClick={() => toggleTodo(todo.id, todo.isDone)}>
                <div className={`${styles.checkbox} ${todo.isDone ? styles.checkboxChecked : ''}`}>
                  {todo.isDone && <span>✓</span>}
                </div>
                <span className={`${styles.todoText} ${todo.isDone ? styles.todoDone : ''}`}>
                  {todo.text}
                </span>
              </div>
              <button className={styles.deleteButton} onClick={() => deleteTodo(todo.id)}>
                ✕
              </button>
            </div>
          ))}
          {todos.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>
              No tasks yet. Add one above!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
