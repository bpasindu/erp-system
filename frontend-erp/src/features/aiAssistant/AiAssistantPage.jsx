import React, { useState } from 'react';
import '../products/ProductsPage.css';
import './AiAssistantPage.css';

const AiAssistantPage = () => {
  const [activeTab, setActiveTab] = useState('insights');

  return (
    <div className="products-page ai-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">
            Get insights, generate emails, and create marketing posts for your business.
          </p>
        </div>
      </div>

      <div className="ai-tabs">
        <button
          type="button"
          className={`ai-tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          💡 Insights Q&amp;A
        </button>
        <button
          type="button"
          className={`ai-tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          ✉️ Email Generator
        </button>
        <button
          type="button"
          className={`ai-tab ${activeTab === 'marketing' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketing')}
        >
          📣 Marketing Post
        </button>
      </div>

      {activeTab === 'insights' && (
        <div className="ai-content">
          <div className="ai-quick-questions">
            <button type="button" className="ai-chip">
              How did I perform last month?
            </button>
            <button type="button" className="ai-chip">
              What products are low stock?
            </button>
            <button type="button" className="ai-chip">
              Compare this week vs last week
            </button>
          </div>
          <div className="ai-chat-panel">
            <div className="ai-chat-body">
              <p className="ai-placeholder">Ask me anything about your business!</p>
            </div>
            <div className="ai-chat-input-row">
              <input
                type="text"
                placeholder="Ask about your business..."
              />
              <button type="button" className="ai-send-button">
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div className="ai-content">
          <div className="ai-card">
            <div className="ai-grid">
              <div className="form-group">
                <label>Customer</label>
                <select>
                  <option>Select customer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tone</label>
                <select defaultValue="Friendly">
                  <option>Friendly</option>
                  <option>Formal</option>
                  <option>Casual</option>
                </select>
              </div>
              <div className="form-group">
                <label>Goal</label>
                <select defaultValue="Follow-up">
                  <option>Follow-up</option>
                  <option>Payment reminder</option>
                  <option>Promotion</option>
                </select>
              </div>
              <div className="form-group">
                <label>Key Points</label>
                <input placeholder="Main points to include..." />
              </div>
            </div>
            <button type="button" className="btn btn-primary ai-primary-btn">
              Generate Email
            </button>
          </div>
        </div>
      )}

      {activeTab === 'marketing' && (
        <div className="ai-content">
          <div className="ai-card">
            <div className="ai-grid">
              <div className="form-group">
                <label>Platform</label>
                <select defaultValue="Facebook">
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>Twitter</option>
                </select>
              </div>
              <div className="form-group">
                <label>Theme</label>
                <select defaultValue="New Arrivals">
                  <option>New Arrivals</option>
                  <option>Sale</option>
                  <option>Holiday</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tone</label>
                <select defaultValue="Excited">
                  <option>Excited</option>
                  <option>Professional</option>
                  <option>Playful</option>
                </select>
              </div>
              <div className="form-group toggle-group">
                <label>Include emojis</label>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider" />
                </label>
              </div>
            </div>
            <button type="button" className="btn btn-primary ai-primary-btn">
              Generate Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistantPage;

