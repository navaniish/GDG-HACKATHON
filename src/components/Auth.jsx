import React, { useState } from 'react';
import { Shield, Lock, Key, Server, Building } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('admin@grandhyatt.mumbai.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState('GDG_HACKATHON_DEMO');

  const handleAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate Supabase Auth Verification Delay
    setTimeout(() => {
      setLoading(false);
      onLogin({
        email,
        tenant_id: tenant,
        role: 'tenant_admin'
      });
    }, 1200);
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#05070a',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Background Ambience */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at top, rgba(0,210,255,0.05) 0%, transparent 50%), radial-gradient(circle at bottom, rgba(255,45,85,0.03) 0%, transparent 50%)',
        zIndex: 0
      }} />

      <div style={{
        width: '400px',
        background: 'rgba(13, 17, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '40px',
        zIndex: 10,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '12px', 
            background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(0,210,255,0.05))',
            border: '1px solid rgba(0,210,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 0 30px rgba(0,210,255,0.2)'
          }}>
            <Shield color="#00d2ff" size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', letterSpacing: '0.1em', margin: 0 }} className="font-orbitron">
            SENTINEL-X
          </h1>
          <div style={{ fontSize: '10px', color: '#00d2ff', letterSpacing: '0.2em', marginTop: '4px' }} className="font-mono">
            SECURE_SAAS_AUTH_GATEWAY
          </div>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }} className="font-mono">
              <Building size={12} /> Tenant Configuration
            </label>
            <select
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              style={{
                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff',
                fontSize: '12px', outline: 'none'
              }}
            >
              <option value="GDG_HACKATHON_DEMO">GDG Prototype (Node-01)</option>
              <option value="GRAND_HYATT_BOM">Grand Hyatt Mumbai</option>
              <option value="MARRIOTT_NYC">Marriott NYC Core</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }} className="font-mono">
              <Lock size={12} /> Operator Credentials
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@tenant.com"
              style={{
                width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff',
                fontSize: '12px', outline: 'none', marginBottom: '10px'
              }}
            />
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{
                  width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff',
                  fontSize: '12px', outline: 'none'
                }}
              />
              <Key size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', background: loading ? 'rgba(0,210,255,0.1)' : 'rgba(0,210,255,0.15)',
              border: '1px solid rgba(0,210,255,0.3)', borderRadius: '8px', color: '#00d2ff',
              fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
            }}
            className="font-mono"
            onMouseOver={(e) => e.target.style.background = 'rgba(0,210,255,0.25)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(0,210,255,0.15)'}
          >
            {loading ? <Server size={16} className="spin" /> : 'ESTABLISH_UPLINK'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
           <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }} className="font-mono">DB: SUPABASE_CLOUD</span>
           <span style={{ fontSize: '9px', color: '#30d158' }} className="font-mono">STATUS: OPERATIONAL</span>
        </div>
      </div>
      
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
