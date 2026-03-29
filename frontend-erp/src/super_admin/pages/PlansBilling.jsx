import React from 'react';
import './PlansBilling.css';

const PlansBilling = () => {
  const plans = [
    {
      name: 'Free',
      monthly: 0,
      annual: 0,
      users: 1,
      invoices: 50,
      aiRequests: 10,
      storage: '1 GB',
      features: [
        { name: 'AI Insights', included: false },
        { name: 'Email Generation', included: false },
        { name: 'Marketing Post', included: false },
        { name: 'PDF Invoices', included: true },
        { name: 'Voice Input', included: false },
      ],
      subscribers: 8
    },
    {
      name: 'Starter',
      monthly: 2500,
      annual: 25000,
      users: 5,
      invoices: 200,
      aiRequests: 100,
      storage: '5 GB',
      features: [
        { name: 'AI Insights', included: true },
        { name: 'Email Generation', included: false },
        { name: 'Marketing Post', included: false },
        { name: 'PDF Invoices', included: true },
        { name: 'Voice Input', included: false },
      ],
      subscribers: 7
    },
    {
      name: 'Pro',
      monthly: 7500,
      annual: 75000,
      users: 20,
      invoices: 1000,
      aiRequests: 500,
      storage: '25 GB',
      features: [
        { name: 'AI Insights', included: true },
        { name: 'Email Generation', included: true },
        { name: 'Marketing Post', included: true },
        { name: 'PDF Invoices', included: true },
        { name: 'Voice Input', included: true },
      ],
      subscribers: 6
    },
    {
      name: 'Enterprise',
      monthly: 25000,
      annual: 250000,
      users: 'Unlimited',
      invoices: 'Unlimited',
      aiRequests: 'Unlimited',
      storage: '100 GB',
      features: [
        { name: 'AI Insights', included: true },
        { name: 'Email Generation', included: true },
        { name: 'Marketing Post', included: true },
        { name: 'PDF Invoices', included: true },
        { name: 'Voice Input', included: true },
      ],
      subscribers: 4
    }
  ];

  return (
    <div className="sa-plans-billing">
      <div className="sa-page-header sa-pb-header">
        <div>
          <h1 className="sa-page-title">Plans & Billing</h1>
          <p className="sa-page-subtitle">Manage subscription plans</p>
        </div>
        {/* <button className="sa-btn-primary">+ Create Plan</button> */}
      </div>

      <div className="sa-pb-grid">
        {plans.map((plan, index) => (
          <div className="sa-pb-card" key={index}>
            <h2 className="sa-pb-title">{plan.name}</h2>
            
            <div className="sa-pb-pricing">
              <span className="sa-pb-price">LKR {plan.monthly.toLocaleString()}<small>/mo</small></span>
              <span className="sa-pb-annual">LKR {plan.annual.toLocaleString()}/year</span>
            </div>

            <div className="sa-pb-limits">
              <div><span className="sa-pb-label">Max Users:</span> <strong>{plan.users}</strong></div>
              <div><span className="sa-pb-label">Max Invoices:</span> <strong>{plan.invoices}</strong></div>
              <div><span className="sa-pb-label">AI Requests:</span> <strong>{plan.aiRequests}</strong></div>
              <div><span className="sa-pb-label">Storage:</span> <strong>{plan.storage}</strong></div>
            </div>

            <ul className="sa-pb-features">
              {plan.features.map((feat, i) => (
                <li key={i} className={feat.included ? 'included' : 'excluded'}>
                  <span className="icon">{feat.included ? '✓' : '✕'}</span> {feat.name}
                </li>
              ))}
            </ul>

            <div className="sa-pb-footer">
              <span className="sa-pb-subs">{plan.subscribers} subscribers</span>
              <div className="sa-pb-actions">
                {/* <button className="sa-icon-action text-blue">Edit</button>
                <button className="sa-icon-action text-gray">Dup</button>
                <button className="sa-icon-action text-orange">Disable</button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansBilling;
