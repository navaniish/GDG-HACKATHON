import React, { useState, useEffect } from 'react';

// Languages supported
const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧' },
  hi: { label: 'हिन्दी', flag: '🇮🇳' },
  fr: { label: 'Français', flag: '🇫🇷' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  es: { label: 'Español', flag: '🇪🇸' },
};

const TRANSLATIONS = {
  fire: {
    en: 'Attention all guests. Please evacuate the building immediately using the nearest emergency exit.',
    hi: 'सभी मेहमानों का ध्यान! कृपया तुरंत निकटतम आपातकालीन निकास का उपयोग करके भवन खाली करें।',
    fr: 'Attention à tous les clients. Veuillez évacuer immédiatement le bâtiment.',
    de: 'Achtung alle Gäste. Bitte verlassen Sie das Gebäude sofort über den nächsten Notausgang.',
    es: 'Atención a todos los huéspedes. Por favor evacúen el edificio inmediatamente.',
  },
  lockdown: {
    en: 'SECURITY ALERT: Please remain in your room. Lock your door and do not open for anyone.',
    hi: 'सुरक्षा चेतावनी: कृपया अपने कमरे में रहें। दरवाजा बंद रखें और किसी के लिए न खोलें।',
    fr: 'ALERTE SÉCURITÉ: Restez dans votre chambre. Verrouillez votre porte.',
    de: 'SICHERHEITSALARM: Bitte bleiben Sie in Ihrem Zimmer. Schließen Sie Ihre Tür ab.',
    es: 'ALERTA DE SEGURIDAD: Por favor quédese en su habitación. Cierre su puerta con llave.',
  },
  all_clear: {
    en: 'All Clear. The situation has been resolved. Thank you for your patience and cooperation.',
    hi: 'सब ठीक है। स्थिति सुलझा ली गई है। आपके सहयोग के लिए धन्यवाद।',
    fr: 'Tout est clair. La situation a été résolue. Merci de votre patience.',
    de: 'Alles in Ordnung. Die Situation wurde gelöst. Vielen Dank für Ihre Geduld.',
    es: 'Todo despejado. La situación ha sido resuelta. Gracias por su paciencia.',
  },
};

const GUEST_MSGS = [
  { room: '214', lang: 'hi', text: 'मुझे मदद चाहिए, कोई दरवाज़ा खटखटा रहा है', detected: 'Hindi', flag: '🇮🇳', sentiment: 'PANIC', color: '#ff2d55' },
  { room: '306', lang: 'fr', text: 'Il y a de la fumée dans ma chambre!', detected: 'French', flag: '🇫🇷', sentiment: 'DISTRESS', color: '#ff6b35' },
  { room: '118', lang: 'de', text: 'Ich brauche eine Decke, es ist sehr kalt', detected: 'German', flag: '🇩🇪', sentiment: 'NORMAL', color: '#30d158' },
  { room: '201', lang: 'en', text: 'Please send security immediately!', detected: 'English', flag: '🇬🇧', sentiment: 'ALARMED', color: '#ffd60a' },
];

// Guest↔Responder relay
const RELAY_CONVERSATIONS = [
  { from: 'Guest 204', msg: 'Help! There is a man outside my door!', time: '19:43:12', type: 'guest' },
  { from: 'Claude AI', msg: 'Analyzing: High distress language. Room 204 flagged as critical. Dispatching Delta Team. ETA 45s.', time: '19:43:13', type: 'ai' },
  { from: 'Responder Delta', msg: 'En route to Room 204. 45 seconds ETA. Please stay on the line.', time: '19:43:15', type: 'responder' },
  { from: 'Guest 204', msg: 'I locked the door. Please hurry!', time: '19:43:22', type: 'guest' },
  { from: 'Claude AI', msg: 'Guest is secured behind locked door. Threat is in corridor. Recommend approach from fire stairwell.', time: '19:43:23', type: 'ai' },
];

export default function CommunicationBridge({ offlineMode, events }) {
  const [activeTab, setActiveTab] = useState('broadcast');
  const [selectedMsg, setSelectedMsg] = useState('fire');
  const [selectedLangs, setSelectedLangs] = useState(['en', 'hi']);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);
  const [guestMsgs, setGuestMsgs] = useState([]);
  const [externalCalled, setExternalCalled] = useState(false);
  const [relayOpen, setRelayOpen] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [relayMsgs, setRelayMsgs] = useState(RELAY_CONVERSATIONS);

  // Auto-update guest messages
  useEffect(() => {
    const t = setInterval(() => {
      const msg = GUEST_MSGS[Math.floor(Math.random() * GUEST_MSGS.length)];
      setGuestMsgs(prev => [{ ...msg, id: Date.now(), time: new Date() }, ...prev].slice(0, 8));
    }, 7000);
    return () => clearInterval(t);
  }, []);

  const handleBroadcast = () => {
    setBroadcasting(true);
    const text = TRANSLATIONS[selectedMsg].en;
    if ('speechSynthesis' in window) {
      selectedLangs.slice(0, 2).forEach((lang, i) => {
        setTimeout(() => {
          const u = new SpeechSynthesisUtterance(TRANSLATIONS[selectedMsg][lang] || text);
          if (lang === 'hi') u.lang = 'hi-IN';
          else if (lang === 'fr') u.lang = 'fr-FR';
          else if (lang === 'de') u.lang = 'de-DE';
          else if (lang === 'es') u.lang = 'es-ES';
          window.speechSynthesis.speak(u);
        }, i * 500);
      });
    }
    setTimeout(() => { setBroadcasting(false); setBroadcastDone(true); setTimeout(() => setBroadcastDone(false), 3000); }, 1800);
  };

  const callEmergency = () => {
    setExternalCalled(true);
    setTimeout(() => setExternalCalled(false), 5000);
  };

  const sendRelay = () => {
    if (!newMsg.trim()) return;
    setRelayMsgs(prev => [...prev, { from: 'Responder Command', msg: newMsg, time: new Date().toLocaleTimeString(), type: 'responder' }]);
    setNewMsg('');
  };

  const TABS = [
    { id: 'broadcast', label: '📢 Broadcast' },
    { id: 'translate', label: '🌐 Translate' },
    { id: 'relay', label: '💬 Relay' },
    { id: 'external', label: '🚨 Emergency' },
  ];

  return (
    <div style={{ height: '100%', background: 'rgba(13,17,23,0.95)', borderRadius: '10px', border: '1px solid rgba(100,210,255,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, background: 'rgba(100,210,255,0.04)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg,#0a84ff,#64d2ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>📡</div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>COMMUNICATION BRIDGE</div>
          <div style={{ fontSize: '9px', color: 'rgba(100,210,255,0.8)' }}>Unified Alerts · Translation · Relay</div>
        </div>
        {offlineMode && <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#ff6b35', fontWeight: 600, padding: '2px 6px', background: 'rgba(255,107,53,0.1)', borderRadius: '4px', border: '1px solid rgba(255,107,53,0.3)' }}>📡 MESH</span>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: '6px 2px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              borderBottom: activeTab === tab.id ? '2px solid #64d2ff' : '2px solid transparent',
              color: activeTab === tab.id ? '#64d2ff' : 'rgba(255,255,255,0.35)',
              fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>

        {/* Unified Broadcast */}
        {activeTab === 'broadcast' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
              One trigger broadcasts to: Room PA system · In-app push · WhatsApp/SMS · Staff radio · Digital signage — in guest's language.
            </div>
            {/* Message selector */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Select Alert Type</div>
              {Object.keys(TRANSLATIONS).map(key => (
                <button key={key} onClick={() => setSelectedMsg(key)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', marginBottom: '4px',
                    background: selectedMsg === key ? 'rgba(100,210,255,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedMsg === key ? 'rgba(100,210,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '6px', color: selectedMsg === key ? '#64d2ff' : 'rgba(255,255,255,0.6)',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600 }}>
                  {key === 'fire' ? '🔥 Evacuation Alert' : key === 'lockdown' ? '🔒 Lockdown Alert' : '✅ All Clear'}
                </button>
              ))}
            </div>
            {/* Language selector */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Broadcast Languages</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <button key={code} onClick={() => setSelectedLangs(prev => prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code])}
                    style={{ padding: '4px 8px', background: selectedLangs.includes(code) ? 'rgba(100,210,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedLangs.includes(code) ? 'rgba(100,210,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '5px', color: selectedLangs.includes(code) ? '#64d2ff' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px' }}>
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Preview */}
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', marginBottom: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, fontStyle: 'italic' }}>
              "{TRANSLATIONS[selectedMsg]['en']}"
              {selectedLangs.includes('hi') && <div style={{ marginTop: '4px', color: 'rgba(255,255,255,0.4)' }}>"{TRANSLATIONS[selectedMsg]['hi']}"</div>}
            </div>
            {/* Broadcast button */}
            <button onClick={handleBroadcast} disabled={broadcasting || broadcastDone}
              style={{ width: '100%', padding: '10px', background: broadcastDone ? 'rgba(48,209,88,0.15)' : 'rgba(100,210,255,0.15)', border: `1px solid ${broadcastDone ? 'rgba(48,209,88,0.5)' : 'rgba(100,210,255,0.5)'}`, borderRadius: '8px', color: broadcastDone ? '#30d158' : '#64d2ff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {broadcasting ? '📡 Broadcasting...' : broadcastDone ? '✅ Broadcast Sent to All Channels!' : `📢 Broadcast in ${selectedLangs.length} Language${selectedLangs.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* Multilingual Translator */}
        {activeTab === 'translate' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
              Claude detects guest language and routes each alert and instruction in the appropriate language.
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Incoming Guest Messages</div>
            {guestMsgs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '11px', padding: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌐</div>
                Monitoring multilingual comms...
              </div>
            ) : (
              guestMsgs.map(msg => (
                <div key={msg.id} style={{ padding: '9px', marginBottom: '5px', background: `${msg.color}08`, border: `1px solid ${msg.color}25`, borderRadius: '8px', animation: 'fade-in-up 0.3s ease-out' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{msg.flag} Room {msg.room} · {msg.detected}</span>
                    <span style={{ fontSize: '9px', color: `${msg.color}`, fontWeight: 700 }}>{msg.sentiment}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: '4px' }}>"{msg.text}"</div>
                  <div style={{ fontSize: '9px', color: '#64d2ff' }}>🤖 Claude: Auto-routed to {msg.lang === 'hi' ? 'Hindi-speaking duty manager' : 'nearest responder'}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Guest↔Responder Relay */}
        {activeTab === 'relay' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
              Real-time text channel between distressed guest and assigned responder. Claude summarizes context for command center.
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
              {relayMsgs.map((msg, i) => (
                <div key={i} style={{
                  padding: '8px 10px', borderRadius: '8px',
                  background: msg.type === 'guest' ? 'rgba(255,45,85,0.08)' : msg.type === 'ai' ? 'rgba(191,90,242,0.08)' : 'rgba(10,132,255,0.08)',
                  border: `1px solid ${msg.type === 'guest' ? 'rgba(255,45,85,0.2)' : msg.type === 'ai' ? 'rgba(191,90,242,0.2)' : 'rgba(10,132,255,0.2)'}`,
                  alignSelf: msg.type === 'responder' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: msg.type === 'guest' ? '#ff2d55' : msg.type === 'ai' ? '#bf5af2' : '#0a84ff' }}>{msg.from}</span>
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>{msg.time}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{msg.msg}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendRelay()}
                placeholder="Send message to guest..."
                style={{ flex: 1, padding: '7px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '10px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
              <button onClick={sendRelay}
                style={{ padding: '7px 12px', background: 'rgba(10,132,255,0.2)', border: '1px solid rgba(10,132,255,0.4)', borderRadius: '6px', color: '#0a84ff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '11px' }}>▶</button>
            </div>
          </div>
        )}

        {/* Emergency Services */}
        {activeTab === 'external' && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>
              Auto-dials emergency services with pre-filled incident data. No staff needs to make the call manually.
            </div>
            {[
              { label: '🚒 Fire Brigade', number: '101', color: '#ff6b35', dept: 'Mumbai Fire' },
              { label: '🚑 Medical Emergency', number: '108', color: '#ff2d55', dept: 'EMRI Ambulance' },
              { label: '👮 Police', number: '100', color: '#0a84ff', dept: 'Local Police Station' },
              { label: '🔐 Security HQ', number: 'EXT-1234', color: '#bf5af2', dept: 'Hotel Security Center' },
            ].map(svc => (
              <div key={svc.label} style={{ padding: '10px', marginBottom: '6px', background: `${svc.color}08`, border: `1px solid ${svc.color}30`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: svc.color }}>{svc.label}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{svc.dept} · {svc.number}</div>
                  </div>
                  <button onClick={callEmergency}
                    style={{ padding: '5px 10px', background: `${svc.color}20`, border: `1px solid ${svc.color}50`, borderRadius: '6px', color: svc.color, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 700 }}>
                    {externalCalled ? '📞 Calling...' : '📞 Auto-Dial'}
                  </button>
                </div>
                {externalCalled && (
                  <div style={{ marginTop: '6px', fontSize: '9px', color: '#30d158', animation: 'fade-in-up 0.2s ease-out' }}>
                    ✅ Pre-filled: Hotel Grand · {new Date().toLocaleTimeString()} · Location shared · Incident type forwarded
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: '6px', fontSize: '9px', color: 'rgba(48,209,88,0.8)' }}>
              ✅ All calls include: Hotel name, GPS coordinates, incident type, estimated casualties, and AI summary brief.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
