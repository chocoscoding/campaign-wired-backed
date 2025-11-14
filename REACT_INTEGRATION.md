# React Integration Guide - Colla Campaign API

Complete guide for integrating the Colla Campaign API into your React application using fetch.

## Table of Contents
- [Setup](#setup)
- [API Configuration](#api-configuration)
- [Basic Fetch Examples](#basic-fetch-examples)
- [React Hooks](#react-hooks)
- [React Components](#react-components)
- [Complete Examples](#complete-examples)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)

---

## Setup

### 1. Environment Variables

Create a `.env` file in your React project:

```env
REACT_APP_API_URL=http://localhost:8000
# For production:
# REACT_APP_API_URL=https://api.yourdomain.com
```

### 2. API Configuration

Create `src/api/config.js`:

```javascript
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  campaign: {
    call: `${API_URL}/campaign/call`,
    execute: `${API_URL}/campaign/execute`,
  },
  messages: {
    send: `${API_URL}/messages/send`,
    email: `${API_URL}/messages/email`,
    bulkEmail: `${API_URL}/messages/email/bulk`,
  },
  webhooks: {
    inbound: `${API_URL}/webhook/message/inbound`,
    status: `${API_URL}/webhook/message/status`,
  },
};
```

---

## Basic Fetch Examples

### 1. Make a Single Voice Call

```javascript
async function makeVoiceCall(phoneNumber, message) {
  try {
    const response = await fetch('http://localhost:8000/campaign/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        text: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Call initiated:', data);
    return data;
  } catch (error) {
    console.error('Error making call:', error);
    throw error;
  }
}

// Usage
makeVoiceCall('447700900001', 'Hello from Colla!');
```

### 2. Send SMS Message

```javascript
async function sendSMS(phoneNumber, message) {
  try {
    const response = await fetch('http://localhost:8000/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        text: message,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

// Usage
sendSMS('447700900001', 'Your verification code is 123456');
```

### 2.5. Send Single Email

```javascript
async function sendEmail(emailData) {
  try {
    const response = await fetch('http://localhost:8000/messages/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Email send failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Usage - Simple email
sendEmail({
  to: 'john@example.com',
  toName: 'John Doe',
  subject: 'Welcome!',
  html: '<h1>Welcome to Colla!</h1><p>Thanks for signing up.</p>',
  text: 'Welcome to Colla! Thanks for signing up.',
});

// Usage - Email with substitution data and options
sendEmail({
  to: 'john@example.com',
  toName: 'John Doe',
  subject: 'Order {{order_id}} Confirmed',
  html: '<h1>Hi {{first_name}}!</h1><p>Your order {{order_id}} is confirmed.</p>',
  text: 'Hi {{first_name}}! Your order {{order_id}} is confirmed.',
  substitutionData: {
    first_name: 'John',
    order_id: 'ORD-12345',
  },
  metadata: {
    customer_id: '12345',
    order_type: 'online',
  },
  options: {
    transactional: true,      // Mark as transactional email
    clickTracking: true,       // Enable click tracking
    openTracking: true,        // Enable open tracking
    inlineCss: true,          // Inline CSS for better compatibility
  },
  replyTo: 'support@colla.com',
});
```

### 2.6. Send Bulk Emails

```javascript
async function sendBulkEmail(bulkEmailData) {
  try {
    const response = await fetch('http://localhost:8000/messages/email/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bulkEmailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Bulk email send failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending bulk email:', error);
    throw error;
  }
}

// Usage - Send to multiple recipients with full options
sendBulkEmail({
  recipients: [
    {
      email: 'john@example.com',
      name: 'John Doe',
      substitutionData: {
        first_name: 'John',
        discount: '25',
      },
      metadata: {
        user_id: '12345',
        segment: 'vip',
      },
      tags: ['customer', 'vip'],
    },
    {
      email: 'jane@example.com',
      name: 'Jane Smith',
      substitutionData: {
        first_name: 'Jane',
        discount: '30',
      },
    },
  ],
  subject: 'Special {{discount}}% Discount for {{first_name}}!',
  html: '<h1>Hi {{first_name}}!</h1><p>Enjoy {{discount}}% off!</p>',
  text: 'Hi {{first_name}}! Enjoy {{discount}}% off!',
  substitutionData: {
    // Global substitution data for all recipients
    company_name: 'Colla Store',
    year: '2025',
  },
  metadata: {
    campaign_type: 'promotional',
    season: 'winter',
  },
  campaignId: 'winter_sale_2025',
  description: 'Winter sale promotional emails',
  options: {
    transactional: false,     // Marketing email
    clickTracking: true,
    openTracking: true,
    inlineCss: true,
  },
});
```

### 3. Execute Multi-Channel Campaign

```javascript
async function executeCampaign(campaignData) {
  try {
    const response = await fetch('http://localhost:8000/campaign/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Campaign execution failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error executing campaign:', error);
    throw error;
  }
}

// Usage - Email Only
executeCampaign({
  contacts: [
    {
      email: 'john@example.com',
      name: 'John Doe',
      substitutionData: {
        first_name: 'John',
        order_id: 'ORD-12345',
      },
    },
  ],
  channels: ['email'],
  emailSubject: 'Order {{order_id}} Confirmed',
  emailHtml: '<h1>Hi {{first_name}}!</h1><p>Your order is confirmed.</p>',
});

// Usage - All Channels
executeCampaign({
  contacts: [
    {
      phone: '447700900001',
      email: 'vip@example.com',
      name: 'VIP Customer',
      substitutionData: {
        first_name: 'Sarah',
        offer: '$500 off',
      },
    },
  ],
  channels: ['call', 'sms', 'email'],
  callMessage: 'Hello, you have an exclusive offer!',
  smsMessage: 'Check your email for details!',
  emailSubject: 'Exclusive Offer for {{first_name}}',
  emailHtml: '<h1>Hi {{first_name}}!</h1><p>Enjoy {{offer}}</p>',
  emailSubstitutionData: {
    company_name: 'Colla Store',
  },
});
```

---

## React Hooks

### Custom Hook: `useCampaign`

Create `src/hooks/useCampaign.js`:

```javascript
import { useState } from 'react';
import { API_ENDPOINTS } from '../api/config';

export function useCampaign() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const executeCampaign = async (campaignData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINTS.campaign.execute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Campaign execution failed');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const makeCall = async (phoneNumber, message) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.campaign.call, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: phoneNumber, text: message }),
      });

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendSMS = async (phoneNumber, message) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.messages.send, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: phoneNumber, text: message }),
      });

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (emailData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.messages.send.replace('/send', '/email')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Email send failed');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendBulkEmail = async (bulkEmailData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.messages.send.replace('/send', '/email/bulk')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkEmailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk email send failed');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    result,
    executeCampaign,
    makeCall,
    sendSMS,
    sendEmail,
    sendBulkEmail,
  };
}
```

---

## React Components

### 1. Simple Campaign Form

```jsx
import React, { useState } from 'react';
import { useCampaign } from '../hooks/useCampaign';

function SimpleCampaignForm() {
  const { loading, error, result, executeCampaign } = useCampaign();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await executeCampaign({
        contacts: [
          {
            email,
            substitutionData: {
              first_name: firstName,
            },
          },
        ],
        channels: ['email'],
        emailSubject: 'Hello {{first_name}}!',
        emailHtml: `<h1>Hi {{first_name}}!</h1><p>${message}</p>`,
        emailText: `Hi {{first_name}}!\n\n${message}`,
      });

      alert('Campaign sent successfully!');
    } catch (err) {
      alert('Failed to send campaign');
    }
  };

  return (
    <div className="campaign-form">
      <h2>Send Email Campaign</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Campaign'}
        </button>
      </form>

      {error && <div className="error">Error: {error}</div>}
      
      {result && (
        <div className="success">
          Campaign sent! {result.message}
        </div>
      )}
    </div>
  );
}

export default SimpleCampaignForm;
```

### 2. Multi-Channel Campaign Component

```jsx
import React, { useState } from 'react';
import { useCampaign } from '../hooks/useCampaign';

function MultiChannelCampaign() {
  const { loading, error, result, executeCampaign } = useCampaign();
  
  const [contacts, setContacts] = useState([
    { phone: '', email: '', name: '', firstName: '' },
  ]);
  
  const [channels, setChannels] = useState({
    call: false,
    sms: false,
    email: false,
  });

  const [messages, setMessages] = useState({
    call: '',
    sms: '',
    emailSubject: '',
    emailBody: '',
  });

  const addContact = () => {
    setContacts([...contacts, { phone: '', email: '', name: '', firstName: '' }]);
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleChannelToggle = (channel) => {
    setChannels({ ...channels, [channel]: !channels[channel] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedChannels = Object.keys(channels).filter(
      (channel) => channels[channel]
    );

    if (selectedChannels.length === 0) {
      alert('Please select at least one channel');
      return;
    }

    const formattedContacts = contacts.map((contact) => ({
      ...(contact.phone && { phone: contact.phone }),
      ...(contact.email && { email: contact.email }),
      name: contact.name,
      substitutionData: {
        first_name: contact.firstName,
      },
    }));

    try {
      await executeCampaign({
        contacts: formattedContacts,
        channels: selectedChannels,
        ...(channels.call && { callMessage: messages.call }),
        ...(channels.sms && { smsMessage: messages.sms }),
        ...(channels.email && {
          emailSubject: messages.emailSubject,
          emailHtml: `<h1>Hi {{first_name}}!</h1><p>${messages.emailBody}</p>`,
        }),
        delayBetweenContacts: 3000,
      });

      alert('Campaign executed successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="multi-channel-campaign">
      <h2>Multi-Channel Campaign</h2>

      <form onSubmit={handleSubmit}>
        {/* Channel Selection */}
        <div className="channel-selection">
          <h3>Select Channels</h3>
          <label>
            <input
              type="checkbox"
              checked={channels.call}
              onChange={() => handleChannelToggle('call')}
            />
            Voice Call
          </label>
          <label>
            <input
              type="checkbox"
              checked={channels.sms}
              onChange={() => handleChannelToggle('sms')}
            />
            SMS
          </label>
          <label>
            <input
              type="checkbox"
              checked={channels.email}
              onChange={() => handleChannelToggle('email')}
            />
            Email
          </label>
        </div>

        {/* Message Content */}
        <div className="messages">
          <h3>Messages</h3>
          
          {channels.call && (
            <div>
              <label>Call Message:</label>
              <textarea
                value={messages.call}
                onChange={(e) =>
                  setMessages({ ...messages, call: e.target.value })
                }
                placeholder="Text-to-speech message"
              />
            </div>
          )}

          {channels.sms && (
            <div>
              <label>SMS Message:</label>
              <textarea
                value={messages.sms}
                onChange={(e) =>
                  setMessages({ ...messages, sms: e.target.value })
                }
                placeholder="SMS text message"
              />
            </div>
          )}

          {channels.email && (
            <>
              <div>
                <label>Email Subject:</label>
                <input
                  type="text"
                  value={messages.emailSubject}
                  onChange={(e) =>
                    setMessages({ ...messages, emailSubject: e.target.value })
                  }
                  placeholder="Use {{first_name}} for personalization"
                />
              </div>
              <div>
                <label>Email Body:</label>
                <textarea
                  value={messages.emailBody}
                  onChange={(e) =>
                    setMessages({ ...messages, emailBody: e.target.value })
                  }
                  placeholder="Use {{first_name}} for personalization"
                />
              </div>
            </>
          )}
        </div>

        {/* Contacts */}
        <div className="contacts">
          <h3>Contacts</h3>
          {contacts.map((contact, index) => (
            <div key={index} className="contact-row">
              <input
                type="text"
                placeholder="Name"
                value={contact.name}
                onChange={(e) => updateContact(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="First Name"
                value={contact.firstName}
                onChange={(e) =>
                  updateContact(index, 'firstName', e.target.value)
                }
              />
              {(channels.call || channels.sms) && (
                <input
                  type="tel"
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) => updateContact(index, 'phone', e.target.value)}
                />
              )}
              {channels.email && (
                <input
                  type="email"
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) => updateContact(index, 'email', e.target.value)}
                />
              )}
            </div>
          ))}
          <button type="button" onClick={addContact}>
            Add Contact
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending Campaign...' : 'Execute Campaign'}
        </button>
      </form>

      {error && <div className="error">Error: {error}</div>}
      
      {result && (
        <div className="result">
          <h3>Campaign Results</h3>
          <p>{result.message}</p>
          <details>
            <summary>View Details</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default MultiChannelCampaign;
```

### 3. Order Confirmation Component

```jsx
import React from 'react';
import { useCampaign } from '../hooks/useCampaign';

function OrderConfirmation({ order }) {
  const { loading, executeCampaign } = useCampaign();

  const sendOrderConfirmation = async () => {
    try {
      await executeCampaign({
        contacts: [
          {
            email: order.customerEmail,
            phone: order.customerPhone,
            name: order.customerName,
            substitutionData: {
              first_name: order.customerFirstName,
              order_id: order.id,
              order_total: order.total,
              tracking_number: order.trackingNumber,
              items_count: order.items.length,
            },
          },
        ],
        channels: ['email', 'sms'],
        smsMessage: `Your order ${order.id} has shipped! Track at: https://track.example.com/${order.trackingNumber}`,
        emailSubject: 'Your Order {{order_id}} Has Shipped!',
        emailHtml: `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h1>Hi {{first_name}}! 👋</h1>
              <p>Great news! Your order has been shipped.</p>
              <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> {{order_id}}</p>
                <p><strong>Items:</strong> {{items_count}}</p>
                <p><strong>Total:</strong> {{order_total}}</p>
                <p><strong>Tracking:</strong> {{tracking_number}}</p>
              </div>
              <p>Track your package at: 
                <a href="https://track.example.com/{{tracking_number}}">
                  Track Order
                </a>
              </p>
              <p>Thank you for shopping with {{company_name}}!</p>
            </body>
          </html>
        `,
        emailSubstitutionData: {
          company_name: 'Colla Store',
          support_email: 'support@colla.com',
        },
      });

      alert('Order confirmation sent!');
    } catch (error) {
      alert('Failed to send confirmation');
    }
  };

  return (
    <div className="order-confirmation">
      <h3>Order #{order.id}</h3>
      <p>Customer: {order.customerName}</p>
      <p>Total: {order.total}</p>
      <button onClick={sendOrderConfirmation} disabled={loading}>
        {loading ? 'Sending...' : 'Send Confirmation'}
      </button>
    </div>
  );
}

export default OrderConfirmation;
```

### 4. Bulk Campaign Component

```jsx
import React, { useState } from 'react';
import { useCampaign } from '../hooks/useCampaign';

function BulkCampaign() {
  const { loading, error, result, executeCampaign } = useCampaign();
  const [csvData, setCsvData] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      setCsvData(event.target.result);
    };
    
    reader.readAsText(file);
  };

  const parseCsvToContacts = () => {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const contact = {};
      
      headers.forEach((header, index) => {
        if (header === 'substitution_data') {
          try {
            contact.substitutionData = JSON.parse(values[index]);
          } catch {
            contact.substitutionData = {};
          }
        } else {
          contact[header] = values[index];
        }
      });
      
      return contact;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const contacts = parseCsvToContacts();

    try {
      await executeCampaign({
        contacts,
        channels: ['email'],
        emailSubject: 'Special Offer for {{first_name}}!',
        emailHtml: `
          <h1>Hi {{first_name}}!</h1>
          <p>We have a special offer just for you!</p>
          <p>Discount: {{discount}}%</p>
        `,
        emailSubstitutionData: {
          company_name: 'Colla Store',
        },
        delayBetweenContacts: 3000,
      });

      alert(`Campaign sent to ${contacts.length} contacts!`);
    } catch (err) {
      alert('Failed to send bulk campaign');
    }
  };

  return (
    <div className="bulk-campaign">
      <h2>Bulk Campaign</h2>
      
      <div>
        <h3>Upload CSV</h3>
        <p>CSV Format: email,name,substitution_data</p>
        <p>Example: john@example.com,John Doe,"{\"first_name\":\"John\",\"discount\":\"25\"}"</p>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
      </div>

      {csvData && (
        <>
          <div>
            <h3>Preview</h3>
            <pre>{csvData.substring(0, 500)}...</pre>
            <p>Total contacts: {csvData.split('\n').length - 1}</p>
          </div>

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Sending...' : 'Send Bulk Campaign'}
          </button>
        </>
      )}

      {error && <div className="error">Error: {error}</div>}
      {result && <div className="success">Campaign sent! {result.message}</div>}
    </div>
  );
}

export default BulkCampaign;
```

### 5. Simple Email Send Component

```jsx
import React, { useState } from 'react';
import { useCampaign } from '../hooks/useCampaign';

function SendEmailForm() {
  const { loading, error, result, sendEmail } = useCampaign();
  const [formData, setFormData] = useState({
    to: '',
    toName: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await sendEmail({
        to: formData.to,
        toName: formData.toName,
        subject: formData.subject,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h1>Message from Colla</h1>
              <p>${formData.message}</p>
            </body>
          </html>
        `,
        text: formData.message,
      });

      alert('Email sent successfully!');
      setFormData({ to: '', toName: '', subject: '', message: '' });
    } catch (error) {
      alert('Failed to send email');
    }
  };

  return (
    <div className="send-email-form">
      <h2>Send Email</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>To Email:</label>
          <input
            type="email"
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Recipient Name:</label>
          <input
            type="text"
            name="toName"
            value={formData.toName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Subject:</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Message:</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>

      {error && <div className="error">Error: {error}</div>}
      {result && <div className="success">Email sent successfully!</div>}
    </div>
  );
}

export default SendEmailForm;
```

### 6. Bulk Email Component with Personalization

```jsx
import React, { useState } from 'react';
import { useCampaign } from '../hooks/useCampaign';

function BulkEmailForm() {
  const { loading, error, result, sendBulkEmail } = useCampaign();
  const [recipients, setRecipients] = useState([
    { email: '', name: '', firstName: '', customField: '' },
  ]);
  const [emailContent, setEmailContent] = useState({
    subject: '',
    htmlTemplate: '',
  });

  const addRecipient = () => {
    setRecipients([...recipients, { email: '', name: '', firstName: '', customField: '' }]);
  };

  const updateRecipient = (index, field, value) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedRecipients = recipients.map((r) => ({
      email: r.email,
      name: r.name,
      substitutionData: {
        first_name: r.firstName,
        custom_field: r.customField,
      },
    }));

    try {
      await sendBulkEmail({
        recipients: formattedRecipients,
        subject: emailContent.subject,
        html: emailContent.htmlTemplate,
        substitutionData: {
          company_name: 'Colla Store',
          year: new Date().getFullYear(),
        },
      });

      alert(`Bulk email sent to ${recipients.length} recipients!`);
    } catch (error) {
      alert('Failed to send bulk email');
    }
  };

  return (
    <div className="bulk-email-form">
      <h2>Send Bulk Email with Personalization</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <h3>Email Template</h3>
          <div>
            <label>Subject (use {{variable}} for personalization):</label>
            <input
              type="text"
              value={emailContent.subject}
              onChange={(e) =>
                setEmailContent({ ...emailContent, subject: e.target.value })
              }
              placeholder="Hello {{first_name}}!"
              required
            />
          </div>

          <div>
            <label>HTML Content:</label>
            <textarea
              value={emailContent.htmlTemplate}
              onChange={(e) =>
                setEmailContent({ ...emailContent, htmlTemplate: e.target.value })
              }
              rows={10}
              placeholder="<h1>Hi {{first_name}}!</h1><p>{{custom_field}}</p>"
              required
            />
          </div>

          <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginTop: '10px' }}>
            <p><strong>Available Variables:</strong></p>
            <ul>
              <li>{'{{first_name}}'} - Recipient's first name</li>
              <li>{'{{custom_field}}'} - Custom field value</li>
              <li>{'{{company_name}}'} - Company name (global)</li>
              <li>{'{{year}}'} - Current year (global)</li>
            </ul>
          </div>
        </div>

        <div>
          <h3>Recipients</h3>
          {recipients.map((recipient, index) => (
            <div key={index} style={{ 
              border: '1px solid #ddd', 
              padding: '10px', 
              marginBottom: '10px',
              borderRadius: '4px' 
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={recipient.email}
                  onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={recipient.name}
                  onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={recipient.firstName}
                  onChange={(e) => updateRecipient(index, 'firstName', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Custom Field"
                  value={recipient.customField}
                  onChange={(e) => updateRecipient(index, 'customField', e.target.value)}
                />
              </div>
              {recipients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRecipient(index)}
                  style={{ marginTop: '10px', color: 'red' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button type="button" onClick={addRecipient}>
            + Add Recipient
          </button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '20px', 
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending...' : `Send to ${recipients.length} Recipient(s)`}
        </button>
      </form>

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#FEE2E2', 
          color: '#991B1B',
          borderRadius: '4px'
        }}>
          Error: {error}
        </div>
      )}
      
      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#D1FAE5', 
          color: '#065F46',
          borderRadius: '4px'
        }}>
          Success! Emails sent to {result.recipients} recipient(s).
        </div>
      )}
    </div>
  );
}

export default BulkEmailForm;
```

---

## Complete Examples

### Example 1: Newsletter Signup Confirmation

```jsx
import React from 'react';
import { useCampaign } from '../hooks/useCampaign';

function NewsletterSignup() {
  const { loading, executeCampaign } = useCampaign();
  const [email, setEmail] = React.useState('');
  const [firstName, setFirstName] = React.useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // Save to database first...
      // Then send confirmation email

      await executeCampaign({
        contacts: [
          {
            email,
            substitutionData: {
              first_name: firstName,
            },
          },
        ],
        channels: ['email'],
        emailSubject: 'Welcome to {{company_name}}, {{first_name}}!',
        emailHtml: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #4F46E5; color: white; padding: 40px; text-align: center;">
                <h1>Welcome {{first_name}}! 🎉</h1>
              </div>
              <div style="padding: 40px;">
                <p>Thank you for subscribing to our newsletter!</p>
                <p>You'll receive updates about:</p>
                <ul>
                  <li>New products and features</li>
                  <li>Exclusive offers and discounts</li>
                  <li>Industry news and tips</li>
                </ul>
                <p style="text-align: center; margin-top: 40px;">
                  <a href="{{website_url}}" 
                     style="background-color: #4F46E5; color: white; padding: 15px 30px; 
                            text-decoration: none; border-radius: 5px; display: inline-block;">
                    Visit Our Website
                  </a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">
                  You're receiving this because you signed up at {{company_name}}.
                  <a href="{{unsubscribe_url}}">Unsubscribe</a>
                </p>
              </div>
            </body>
          </html>
        `,
        emailSubstitutionData: {
          company_name: 'Colla Store',
          website_url: 'https://colla.com',
          unsubscribe_url: 'https://colla.com/unsubscribe',
        },
      });

      alert('Welcome email sent!');
      setEmail('');
      setFirstName('');
    } catch (error) {
      alert('Failed to send confirmation email');
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Subscribe to Our Newsletter</h2>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}

export default NewsletterSignup;
```

### Example 2: Appointment Reminder System

```jsx
import React, { useEffect } from 'react';
import { useCampaign } from '../hooks/useCampaign';

function AppointmentReminder({ appointment }) {
  const { executeCampaign } = useCampaign();

  const sendReminder = async () => {
    await executeCampaign({
      contacts: [
        {
          phone: appointment.patientPhone,
          email: appointment.patientEmail,
          name: appointment.patientName,
          substitutionData: {
            first_name: appointment.patientFirstName,
            appointment_date: appointment.date,
            appointment_time: appointment.time,
            doctor_name: appointment.doctorName,
            clinic_location: appointment.clinicLocation,
          },
        },
      ],
      channels: ['call', 'sms', 'email'],
      callMessage:
        'Hello {{first_name}}, this is a reminder about your appointment on {{appointment_date}} at {{appointment_time}} with {{doctor_name}}.',
      smsMessage:
        'Appointment Reminder: {{appointment_date}} at {{appointment_time}} with {{doctor_name}} at {{clinic_location}}. Reply CONFIRM.',
      emailSubject: 'Appointment Reminder - {{appointment_date}}',
      emailHtml: `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h1>Appointment Reminder</h1>
            <p>Hello {{first_name}},</p>
            <p>This is a reminder of your upcoming appointment:</p>
            <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
              <p><strong>Date:</strong> {{appointment_date}}</p>
              <p><strong>Time:</strong> {{appointment_time}}</p>
              <p><strong>Doctor:</strong> {{doctor_name}}</p>
              <p><strong>Location:</strong> {{clinic_location}}</p>
            </div>
            <p>Please arrive 15 minutes early.</p>
            <p>Need to reschedule? Call us at {{clinic_phone}}</p>
          </body>
        </html>
      `,
      emailSubstitutionData: {
        clinic_phone: '1-800-CLINIC',
        clinic_email: 'appointments@clinic.com',
      },
    });
  };

  // Send reminder 24 hours before appointment
  useEffect(() => {
    const appointmentTime = new Date(appointment.dateTime);
    const reminderTime = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);
    const now = new Date();

    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      const timer = setTimeout(sendReminder, timeUntilReminder);
      return () => clearTimeout(timer);
    }
  }, [appointment]);

  return (
    <div className="appointment">
      <h3>Appointment Details</h3>
      <p>Patient: {appointment.patientName}</p>
      <p>Date: {appointment.date}</p>
      <p>Time: {appointment.time}</p>
      <button onClick={sendReminder}>Send Reminder Now</button>
    </div>
  );
}

export default AppointmentReminder;
```

---

## Error Handling

### Comprehensive Error Handler

```javascript
async function executeCampaignWithErrorHandling(campaignData) {
  try {
    const response = await fetch('http://localhost:8000/campaign/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json();
      
      switch (response.status) {
        case 400:
          throw new Error(`Invalid request: ${errorData.error}`);
        case 500:
          throw new Error(`Server error: ${errorData.error}`);
        case 502:
          throw new Error(`External service error: ${errorData.error}`);
        default:
          throw new Error(`Request failed: ${response.status}`);
      }
    }

    const data = await response.json();

    // Check for partial failures
    if (data.results) {
      const failures = data.results.filter(
        (result) =>
          result.results.email?.success === false ||
          result.results.call?.success === false ||
          result.results.sms?.success === false
      );

      if (failures.length > 0) {
        console.warn('Some contacts failed:', failures);
      }
    }

    return data;
  } catch (error) {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }

    // Timeout
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw error;
  }
}
```

### Error Display Component

```jsx
function ErrorDisplay({ error }) {
  if (!error) return null;

  return (
    <div className="error-display" style={{
      backgroundColor: '#FEE2E2',
      border: '1px solid #EF4444',
      borderRadius: '4px',
      padding: '12px',
      margin: '10px 0',
      color: '#991B1B',
    }}>
      <strong>Error:</strong> {error}
    </div>
  );
}
```

---

## TypeScript Types

Create `src/types/campaign.ts`:

```typescript
export interface Contact {
  phone?: string;
  email?: string;
  name?: string;
  substitutionData?: Record<string, any>;
}

export interface CampaignRequest {
  contacts: Contact[];
  channels: ('call' | 'sms' | 'email')[];
  callMessage?: string;
  smsMessage?: string;
  emailSubject?: string;
  emailHtml?: string;
  emailText?: string;
  emailSubstitutionData?: Record<string, any>;
  delayBetweenContacts?: number;
}

export interface ContactResult {
  contact: Contact;
  timestamp: string;
  results: {
    email?: {
      success: boolean;
      result?: any;
      error?: string;
    };
    call?: {
      success: boolean;
      result?: any;
      error?: string;
    };
    sms?: {
      success: boolean;
      result?: any;
      error?: string;
    };
  };
}

export interface CampaignResponse {
  success: boolean;
  message: string;
  results: ContactResult[];
}

// Email-specific types
export interface EmailRecipient {
  email: string;
  name?: string;
  substitutionData?: Record<string, any>;
}

export interface SingleEmailRequest {
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  substitutionData?: Record<string, any>;
}

export interface BulkEmailRequest {
  recipients: EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  substitutionData?: Record<string, any>;
}

export interface EmailResponse {
  success: boolean;
  result: {
    total_rejected_recipients: number;
    total_accepted_recipients: number;
    results: Array<{
      success: boolean;
      recipient: string;
      messageId?: string;
      error?: string;
    }>;
  };
}
```

### TypeScript Hook with Email Support

```typescript
import { useState } from 'react';
import { 
  CampaignRequest, 
  CampaignResponse,
  SingleEmailRequest,
  BulkEmailRequest,
  EmailResponse 
} from '../types/campaign';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export function useCampaign() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const executeCampaign = async (
    campaignData: CampaignRequest
  ): Promise<CampaignResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/campaign/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Campaign execution failed');
      }

      const data: CampaignResponse = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (
    emailData: SingleEmailRequest
  ): Promise<EmailResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/messages/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Email send failed');
      }

      const data: EmailResponse = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendBulkEmail = async (
    bulkEmailData: BulkEmailRequest
  ): Promise<EmailResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/messages/email/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkEmailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk email send failed');
      }

      const data: EmailResponse = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const makeCall = async (to: string, text: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/campaign/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Call failed');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendSMS = async (to: string, text: string, from?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, text, from }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'SMS send failed');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    result,
    executeCampaign,
    sendEmail,
    sendBulkEmail,
    makeCall,
    sendSMS,
  };
}
```

---

## Best Practices

### 1. Environment Configuration
```javascript
// Use environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### 2. Loading States
```jsx
{loading && <div className="spinner">Sending campaign...</div>}
{!loading && <button>Send Campaign</button>}
```

### 3. Error Boundaries
```jsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <CampaignForm />
</ErrorBoundary>
```

### 4. Debouncing
```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  // Search contacts
}, 300);
```

### 5. Validation
```javascript
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^\d{10,15}$/.test(phone.replace(/\D/g, ''));
}
```

---

## Testing

### Mock API for Development

```javascript
// src/api/mockCampaignAPI.js
export const mockExecuteCampaign = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
  
  return {
    success: true,
    message: `Campaign executed for ${data.contacts.length} contact(s)`,
    results: data.contacts.map((contact) => ({
      contact,
      timestamp: new Date().toISOString(),
      results: {
        ...(data.channels.includes('email') && {
          email: { success: true, result: { messageUUID: 'mock-uuid-123' } },
        }),
        ...(data.channels.includes('call') && {
          call: { success: true, result: { callUUID: 'mock-call-uuid' } },
        }),
        ...(data.channels.includes('sms') && {
          sms: { success: true, result: { messageUUID: 'mock-sms-uuid' } },
        }),
      },
    })),
  };
};
```

### Use Mock in Development

```javascript
const USE_MOCK_API = process.env.NODE_ENV === 'development';

const executeCampaign = USE_MOCK_API 
  ? mockExecuteCampaign 
  : realExecuteCampaign;
```

---

## Email Configuration

### SMTP Configuration

Email service uses Nodemailer with SMTP. Configure in your backend `.env`:

```env
SMTP_HOST=bulk.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Colla Campaign System
```

**Supported SMTP Providers:**
- Mailtrap (recommended for testing)
- Gmail (use App Password)
- SendGrid
- Amazon SES
- Mailgun
- Any custom SMTP server

### Substitution Data Best Practices

```typescript
// Per-recipient data (higher priority)
{
  recipients: [
    {
      email: 'john@example.com',
      substitutionData: {
        first_name: 'John',      // Overrides global
        order_id: 'ORD-001',
      }
    }
  ],
  // Global data (used as fallback)
  substitutionData: {
    first_name: 'Customer',      // Fallback value
    company_name: 'Colla Store', // Used by all
    year: '2025',
  }
}
```

**Rules:**
- Use `{{variable_name}}` syntax in subject, HTML, and text
- Per-recipient data overrides global data
- Variables are replaced at send time
- No size limits (processed in-memory)

---

## Summary

This guide covered:
- ✅ Basic fetch examples for all endpoints (including email endpoints)
- ✅ Custom React hooks with full email support
- ✅ Complete React components (including email forms)
- ✅ Real-world examples (newsletter, appointments, orders)
- ✅ Nodemailer SMTP email integration with substitution data
- ✅ Error handling
- ✅ TypeScript support with comprehensive types
- ✅ SMTP connection pooling for bulk emails

Start with the simple examples and gradually build up to more complex campaigns!

For more information, see:
- [Backend README](./README.md)
- [Substitution Data Guide](./SUBSTITUTION_DATA.md)
- [Quick Start](./QUICKSTART.md)
