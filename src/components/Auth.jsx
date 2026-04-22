import React, { useState } from 'react';
import { Shield, Lock, Key, Server, Building, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenant, setTenant] = useState('GDG_HACKATHON_DEMO');

  const MOCK_CREDENTIALS = {
    email: 'admin@sentinel.x',
    password: 'tactical-alpha-01'
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Tactical Bypass for Demo Purposes
    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
      setTimeout(() => {
        onLogin({
          id: 'demo-user-123',
          email: MOCK_CREDENTIALS.email,
          tenant_id: tenant,
          role: 'tactical_lead'
        });
      }, 1000);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onLogin({
        ...data.user,
        tenant_id: tenant,
        role: 'operator'
      });
    }
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#05070a',
      fontFamily: 'Inter, sans-serif'
    }}>
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
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', letterSpacing: '0.1em', margin: 0 }}>
            SENTINEL-X
          </h1>
          <div style={{ fontSize: '10px', color: '#00d2ff', letterSpacing: '0.2em', marginTop: '4px' }}>
            TACTICAL_AUTH_GATEWAY
          </div>
        </div>

        {error && (
          <div style={{ 
            display: 'flex', gap: '10px', alignItems: 'center', 
            background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.3)', 
            padding: '12px', borderRadius: '8px', marginBottom: '20px', color: '#ff3b3b', fontSize: '11px' 
          }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>
              <Building size={12} /> Target Node
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
              <option value="GDG_HACKATHON_DEMO">GDG Prototype (Mumbai)</option>
              <option value="GLOBAL_COMMAND">Global Intelligence Core</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>
              <Lock size={12} /> Operator Credentials
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@sentinel-x.ai"
              required
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
                placeholder="Authorization Code"
                required
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
          >
            {loading ? <Server size={16} className="spin" /> : 'AUTHORIZE_UPLINK'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(0,210,255,0.02)', border: '1px dashed rgba(0,210,255,0.2)', borderRadius: '4px' }}>
          <div style={{ fontSize: '8px', color: 'var(--text-dim)', marginBottom: '5px' }}>DEMO ACCESS:</div>
          <div style={{ fontSize: '9px', color: '#fff', fontFamily: 'monospace' }}>
            admin@sentinel.x / tactical-alpha-01
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
           <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>SYSTEM: SUPABASE_AUTH</span>
           <span style={{ fontSize: '9px', color: '#30d158' }}>STATUS: ONLINE</span>
        </div>
      </div>
      
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
