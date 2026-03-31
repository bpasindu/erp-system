import React from 'react';

const TopHeader = () => {
  return (
    <header className="top-header">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search..." aria-label="Search" />
      </div>
      <div className="header-actions">
        <div className="profile-avatar">
          <span>SB</span>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;

