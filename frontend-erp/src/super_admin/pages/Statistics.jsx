import React, { useState } from 'react';
import './Statistics.css';

const Statistics = () => {
  const [activeTab, setActiveTab] = useState('Growth');

  return (
    <div className="sa-statistics">
      <div className="sa-page-header sa-stats-header">
        <div>
          <h1 className="sa-page-title">Statistics</h1>
          <p className="sa-page-subtitle">System-wide analytics</p>
        </div>
        <button className="sa-btn-outline">↓ Export</button>
      </div>

      <div className="sa-stats-tabs">
        <button className={`sa-tab ${activeTab === 'Growth' ? 'active' : ''}`} onClick={() => setActiveTab('Growth')}>Growth</button>
        <button className={`sa-tab ${activeTab === 'Revenue' ? 'active' : ''}`} onClick={() => setActiveTab('Revenue')}>Revenue</button>
        <button className={`sa-tab ${activeTab === 'Engagement' ? 'active' : ''}`} onClick={() => setActiveTab('Engagement')}>Engagement</button>
        <button className={`sa-tab ${activeTab === 'AI Analytics' ? 'active' : ''}`} onClick={() => setActiveTab('AI Analytics')}>AI Analytics</button>
      </div>

      <div className="sa-stats-grid">
        <div className="sa-stats-card sa-stats-wide">
          <h3 className="sa-stats-card-title">New Signups</h3>
          <div className="sa-stats-chart-large">
            <div className="sa-mock-bar-chart">
              {/* Specifically matched visual mock to user's screenshot */}
              {[4, 3, 1, 1, 4, 1, 6, 6, 1, 1, 2, 5, 4, 4, 3, 4, 6, 3, 3, 4, 6, 2, 2, 5, 3, 3, 4].map((val, i) => (
                <div key={i} className="sa-bar" style={{height: `${val * 15}%`}}></div>
              ))}
            </div>
            <div className="sa-chart-labels">
              <span>Jan 16</span>
              <span>Jan 22</span>
              <span>Jan 28</span>
              <span>Feb 3</span>
              <span>Feb 9</span>
            </div>
          </div>
        </div>

        <div className="sa-stats-card sa-stats-wide">
          <h3 className="sa-stats-card-title">Churn Rate (Mock)</h3>
          <div className="sa-stats-chart-large">
             <div className="sa-mock-line-chart">
                <svg viewBox="0 0 500 200" className="sa-line-svg" preserveAspectRatio="none">
                   {/* Simulating the red aggressive squiggly line from screenshot */}
                   <path d="M0,100 L20,100 L30,200 L40,200 L50,0 L60,100 L70,200 L80,200 L90,100 L110,100 L120,200 L130,10 L150,200 L160,100 L180,100 L190,200 L200,10 L220,10 L230,200 L250,10 L270,10 L280,100 L290,200 L310,200 M310,200 L500,200" 
                         fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
                </svg>
             </div>
             <div className="sa-chart-labels">
              <span>Jan 16</span>
              <span>Jan 22</span>
              <span>Jan 28</span>
              <span>Feb 3</span>
              <span>Feb 9</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
