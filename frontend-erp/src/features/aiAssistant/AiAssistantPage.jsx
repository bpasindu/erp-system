import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../products/ProductsPage.css';
import './AiAssistantPage.css';
import { API_BASE_URL } from '../../config';

const AiAssistantPage = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Email Generator Form State
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [goal, setGoal] = useState('Follow-up');
  const [keyPoints, setKeyPoints] = useState('');
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateStatus, setGenerateStatus] = useState('');
  const [generateResult, setGenerateResult] = useState('');

  // Supplier Order Generator Form State
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [supplierGenerateLoading, setSupplierGenerateLoading] = useState(false);
  const [supplierGenerateStatus, setSupplierGenerateStatus] = useState('');
  const [supplierGenerateResult, setSupplierGenerateResult] = useState('');
  const [supplierEmailType, setSupplierEmailType] = useState('Add Order');
  const [supplierCustomInfo, setSupplierCustomInfo] = useState('');

  // Customer custom text
  const [customerCustomInfo, setCustomerCustomInfo] = useState('');

  // Insights Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Marketing Post State
  const [marketingPlatform, setMarketingPlatform] = useState('Facebook');
  const [marketingTheme, setMarketingTheme] = useState('New Arrivals');
  const [marketingTone, setMarketingTone] = useState('Excited');
  const [marketingEmojis, setMarketingEmojis] = useState(true);
  const [marketingPrompt, setMarketingPrompt] = useState('');
  const [marketingResult, setMarketingResult] = useState('');
  const [marketingImageUrl, setMarketingImageUrl] = useState('');
  const [marketingLoading, setMarketingLoading] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { businessId: 1, id: 1 };
    } catch {
      return { businessId: 1, id: 1 };
    }
  })();
  const token = localStorage.getItem('token');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.prefillEntity && location.state?.type) {
      setActiveTab('email');
      if (location.state.type === 'customers') {
        setSelectedCustomer(location.state.prefillEntity.id);
      } else if (location.state.type === 'suppliers') {
        setSelectedSupplier(location.state.prefillEntity.id);
      }
      window.scrollTo(0, 0);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchEntities = async () => {
      if (!user?.businessId) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Customers
        const custRes = await fetch(`${API_BASE_URL}/api/customers/business/${user.businessId}`, { headers });
        const custData = await custRes.json();
        if (custData.success) {
          setCustomers(custData.data || []);
        }

        // Fetch Suppliers
        const supRes = await fetch(`${API_BASE_URL}/api/suppliers/business/${user.businessId}`, { headers });
        const supData = await supRes.json();
        if (supData.success) {
          setSuppliers(supData.data || []);
        }

        // Fetch Products
        const prodRes = await fetch(`${API_BASE_URL}/api/products/business/${user.businessId}`, { headers });
        const prodData = await prodRes.json();
        if (prodData.success) {
          setProducts(prodData.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch entities', err);
      }
    };
    fetchEntities();
  }, [user?.businessId, token]);

  const handleGenerateEmail = async () => {
    if (!selectedCustomer) {
      setGenerateStatus('⚠️ Please select a customer.');
      setTimeout(() => setGenerateStatus(''), 3000);
      return;
    }

    setGenerateLoading(true);
    setGenerateStatus('Crafting your email...');
    setGenerateResult('');
    
    try {
      const customerInfo = customers.find(c => String(c.id) === String(selectedCustomer));
      const customerName = customerInfo ? customerInfo.name : 'Unknown';
      
      const prompt = `Write a ${tone} ${goal} email to my customer named ${customerName}. Specific instructions about what to inform the customer: "${customerCustomInfo}". Key points: ${keyPoints}. Keep the tone appropriate for a business setting.`;
      
      const result = await callNativeAI(prompt, 'EMAIL');
      
      setGenerateResult(result?.response || '');
      setGenerateStatus('✅ Email generated successfully!');
      setTimeout(() => setGenerateStatus(''), 5000);
    } catch (error) {
      console.error(error);
      setGenerateStatus('❌ Failed to generate email. Check backend connection.');
      setTimeout(() => setGenerateStatus(''), 5000);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !orderQuantity) return;
    const prod = products.find(p => String(p.id) === String(selectedProduct));
    if (prod) {
      setOrderItems([...orderItems, { 
        productId: prod.id, 
        productName: prod.name, 
        quantity: parseInt(orderQuantity, 10) 
      }]);
      setSelectedProduct('');
      setOrderQuantity('');
    }
  };

  const handleRemoveProduct = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleGenerateSupplierEmail = async () => {
    if (!selectedSupplier) {
      setSupplierGenerateStatus('⚠️ Please select a supplier.');
      setTimeout(() => setSupplierGenerateStatus(''), 3000);
      return;
    }
    if (supplierEmailType === 'Add Order' && orderItems.length === 0) {
      setSupplierGenerateStatus('⚠️ Please add at least one product for the order.');
      setTimeout(() => setSupplierGenerateStatus(''), 3000);
      return;
    }

    setSupplierGenerateLoading(true);
    setSupplierGenerateStatus('Drafting order email...');
    setSupplierGenerateResult('');
    
    try {
      const supplierInfo = suppliers.find(s => String(s.id) === String(selectedSupplier));
      const supplierName = supplierInfo ? supplierInfo.name : 'Unknown';
      
      let prompt = `Write a formal, professional email to our supplier, ${supplierName}. `;
      if (supplierEmailType === 'Add Order') {
         const itemsList = orderItems.map(item => `${item.productName} (Quantity: ${item.quantity})`).join('\\n- ');
         prompt += `Request to order the following products:\n- ${itemsList}\nAsk for confirmation of the order and estimated delivery time. `;
      } else {
         prompt += `The main purpose of this email is to follow up and hurry up a pre-order or pending delivery. `;
      }
      
      if (supplierCustomInfo.trim() !== '') {
         prompt += `\nSpecific information to inform the supplier: "${supplierCustomInfo}".`;
      }
      
      const result = await callNativeAI(prompt, 'EMAIL');
      
      setSupplierGenerateResult(result?.response || '');
      setSupplierGenerateStatus('✅ Order email generated successfully!');
      setTimeout(() => setSupplierGenerateStatus(''), 5000);
    } catch (error) {
      console.error(error);
      setSupplierGenerateStatus('❌ Failed to generate supplier email.');
      setTimeout(() => setSupplierGenerateStatus(''), 5000);
    } finally {
      setSupplierGenerateLoading(false);
    }
  };

  const callNativeAI = async (prompt, requestType) => {
    const res = await fetch(`${API_BASE_URL}/api/ai/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        businessId: user.businessId || 1,
        userId: user.id || user.userId || 1,
        prompt: prompt,
        requestType: requestType
      })
    });
    const data = await res.json();
    return data.data;
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setChatHistory([...chatHistory, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const prompt = `You are a helpful ERP AI assistant for a business using SmartBiz software. Answer the user's question concisely. Question: ${chatInput}`;
      const replyData = await callNativeAI(prompt, 'CHAT');
      // If reply is undefined, it means the API call failed silently
      if (!replyData || !replyData.response) {
        throw new Error("Empty reply");
      }
      setChatHistory(prev => [...prev, { role: 'bot', text: replyData.response }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error connecting to the AI.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateMarketingPost = async () => {
    setMarketingLoading(true);
    setMarketingResult('Generating your perfectly crafted post and image...');
    setMarketingImageUrl('');
    try {
       let prompt = `Write a ${marketingTone} promotional marketing post for ${marketingPlatform} about ${marketingTheme}. ${marketingEmojis ? 'Include appropriate emojis.' : 'Do NOT include emojis.'} Keep it high-converting, strictly professional yet engaging, and under 3 short paragraphs. `;
       if (marketingPrompt.trim()) {
           prompt += `\nSpecific details for the post and image: "${marketingPrompt}"`;
       }
       const result = await callNativeAI(prompt, 'MARKETING');
       setMarketingResult(result?.response || '');
       setMarketingImageUrl(result?.imageUrl || '');
    } catch (err) {
       setMarketingResult('Failed to generate marketing post. Check backend connection.');
    } finally {
       setMarketingLoading(false);
    }
  };

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
            <button type="button" className="ai-chip" onClick={() => setChatInput("How did I perform last month?")}>
              How did I perform last month?
            </button>
            <button type="button" className="ai-chip" onClick={() => setChatInput("What products are low stock?")}>
              What products are low stock?
            </button>
            <button type="button" className="ai-chip" onClick={() => setChatInput("Compare this week vs last week")}>
              Compare this week vs last week
            </button>
          </div>
          <div className="ai-chat-panel">
            <div className="ai-chat-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatHistory.length === 0 ? (
                <p className="ai-placeholder">Ask me anything about your business!</p>
              ) : (
                chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.role === 'user' ? '#4f46e5' : '#f3f4f6',
                    color: msg.role === 'user' ? 'white' : '#1f2937',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    maxWidth: '80%',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.95rem'
                  }}>
                    {msg.text}
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>Thinking...</div>
              )}
            </div>
            <div className="ai-chat-input-row">
              <input
                type="text"
                placeholder="Ask about your business..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
              />
              <button type="button" className="ai-send-button" onClick={handleSendChatMessage} disabled={chatLoading}>
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div className="ai-content">
          <div className="ai-card" style={{ marginBottom: '1rem', backgroundColor: '#fffbe1', border: '1px solid #fde047' }}>
            <h3 style={{ marginTop: 0, color: '#ca8a04' }}>Supplier Order Generator 📦</h3>
            <p style={{ color: '#a16207', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Select a supplier, add the products you need, and generate an order email.
            </p>
            
            <div className="ai-grid" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Supplier</label>
                <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
                  <option value="">Select supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Email Reason</label>
                <select value={supplierEmailType} onChange={(e) => setSupplierEmailType(e.target.value)}>
                  <option value="Add Order">1. Add Order</option>
                  <option value="Hurry up pre-order">2. Hurry up pre-order</option>
                </select>
              </div>
            </div>

            {supplierEmailType === 'Add Order' && (
              <>
                <div className="ai-grid" style={{ marginBottom: '1rem', alignItems: 'end' }}>
              <div className="form-group">
                <label>Product</label>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="Qty" 
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                />
              </div>
              <div className="form-group">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAddProduct}
                  style={{ height: '40px', padding: '0 1rem' }}
                >
                  + Add
                </button>
              </div>
            </div>

            {orderItems.length > 0 && (
              <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fef9c3', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#854d0e' }}>Order Items:</h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#713f12', fontSize: '0.9rem' }}>
                  {orderItems.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.2rem' }}>
                      {item.productName} (x{item.quantity})
                      <button 
                        style={{ marginLeft: '10px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => handleRemoveProduct(idx)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
              </>
            )}

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>What information to inform the supplier?</label>
              <textarea 
                rows="3"
                placeholder="e.g. We need this urgently delivered by Friday, please expedite..."
                value={supplierCustomInfo}
                onChange={(e) => setSupplierCustomInfo(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
              />
            </div>

            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleGenerateSupplierEmail}
              disabled={supplierGenerateLoading || (supplierEmailType === 'Add Order' && orderItems.length === 0) || !selectedSupplier}
              style={{ backgroundColor: '#eab308', borderColor: '#eab308', color: '#422006' }}
            >
              {supplierGenerateLoading ? 'Generating...' : '📦 Generate Supplier Email'}
            </button>
            {supplierGenerateStatus && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>{supplierGenerateStatus}</div>}
            
            {supplierGenerateResult && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fcf8e3', border: '1px solid #fde047', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#854d0e', fontSize: '0.9rem' }}>Generated Order Email:</h4>
                <div style={{ whiteSpace: 'pre-wrap', color: '#422006', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {supplierGenerateResult}
                </div>
              </div>
            )}
          </div>

          <div className="ai-card">
            <div className="ai-grid">
              <div className="form-group">
                <label>Customer</label>
                <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                  <option value="">Select customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="Friendly">Friendly</option>
                  <option value="Formal">Formal</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>
              <div className="form-group">
                <label>Goal</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Payment reminder">Payment reminder</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Apology">Apology</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <label>What information should be in the email?</label>
                <textarea 
                  rows="3"
                  placeholder="e.g. Tell them about their upcoming shipment, give them a special dynamic discount..."
                  value={customerCustomInfo}
                  onChange={(e) => setCustomerCustomInfo(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                />
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-primary ai-primary-btn"
              onClick={handleGenerateEmail}
              disabled={generateLoading}
            >
              {generateLoading ? 'Generating...' : '✨ Generate Email'}
            </button>
            {generateStatus && <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 'bold' }}>{generateStatus}</div>}

            {generateResult && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '0.9rem' }}>Generated Customer Email:</h4>
                <div style={{ whiteSpace: 'pre-wrap', color: '#0f172a', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {generateResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'marketing' && (
        <div className="ai-content">
          <div className="ai-card">
            <div className="ai-grid">
              <div className="form-group">
                <label>Platform</label>
                <select value={marketingPlatform} onChange={e => setMarketingPlatform(e.target.value)}>
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>Twitter</option>
                  <option>LinkedIn</option>
                </select>
              </div>
              <div className="form-group">
                <label>Theme</label>
                <select value={marketingTheme} onChange={e => setMarketingTheme(e.target.value)}>
                  <option>New Arrivals</option>
                  <option>Sale / Discount</option>
                  <option>Product Spotlight</option>
                  <option>Holiday</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tone</label>
                <select value={marketingTone} onChange={e => setMarketingTone(e.target.value)}>
                  <option>Excited</option>
                  <option>Professional</option>
                  <option>Playful</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div className="form-group toggle-group">
                <label>Include emojis</label>
                <label className="switch">
                  <input type="checkbox" checked={marketingEmojis} onChange={e => setMarketingEmojis(e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <label>Specific Product / Content Details (Used for Post and Image)</label>
                <textarea 
                  rows="3"
                  placeholder="e.g. Emphasize the new elegant golden watch resting on velvet..."
                  value={marketingPrompt}
                  onChange={e => setMarketingPrompt(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                />
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-primary ai-primary-btn" 
              onClick={handleGenerateMarketingPost}
              disabled={marketingLoading}
            >
              {marketingLoading ? 'Generating...' : '✨ Generate Post'}
            </button>
            
            {marketingResult && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '0.9rem' }}>Generated Post:</h4>
                {marketingImageUrl && (
                  <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <img src={marketingImageUrl} alt="Generated Marketing" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap', color: '#0f172a', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {marketingResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistantPage;

