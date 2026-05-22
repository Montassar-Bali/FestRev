import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  CameraOff,
  User,
  Ticket,
  Clock,
  Hash,
  RotateCcw,
  Zap,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTicketStore } from '../store/ticketStore';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';

// ── Scan result status types ──
const STATUS = {
  IDLE: 'idle',
  SUCCESS: 'success',
  ALREADY: 'already',
  NOT_FOUND: 'not_found',
  ERROR: 'error',
};

// ── Sound effects (Web Audio API, no external files) ──
function playBeep(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.start(ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === 'already') {
      osc.frequency.value = 440;
      gain.gain.value = 0.12;
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.value = 300;
      gain.gain.value = 0.12;
      osc.start(ctx.currentTime);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // Audio not available — silent
  }
}

export default function Scanner() {
  const { tickets, toggleCompost } = useTicketStore();

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { status, ticket, code }
  const [history, setHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualCode, setManualCode] = useState('');

  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const cooldownRef = useRef(false);

  // ── Stats derived from session history ──
  const sessionStats = {
    total: history.length,
    success: history.filter((h) => h.status === STATUS.SUCCESS).length,
    already: history.filter((h) => h.status === STATUS.ALREADY).length,
    notFound: history.filter((h) => h.status === STATUS.NOT_FOUND).length,
  };

  // ── Extract meaningful code(s) from QR content ──
  // Weezevent QR codes may contain a URL, a barcode number, or a raw code
  const extractCodes = useCallback((raw) => {
    if (!raw) return [];
    const trimmed = raw.trim();
    const candidates = [trimmed];

    // If it's a URL, extract path segments and query params as candidates
    try {
      const url = new URL(trimmed);
      // Add each non-empty path segment
      url.pathname.split('/').forEach((seg) => {
        if (seg && seg.length > 3) candidates.push(seg);
      });
      // Add query parameter values
      url.searchParams.forEach((val) => {
        if (val && val.length > 3) candidates.push(val);
      });
    } catch {
      // Not a URL — that's fine
    }

    // Strip common Weezevent URL prefixes if present
    const urlPrefixes = ['https://weezevent.com/', 'https://tickets.weezevent.com/', 'http://weezevent.com/'];
    urlPrefixes.forEach((prefix) => {
      if (trimmed.toLowerCase().startsWith(prefix)) {
        const rest = trimmed.slice(prefix.length).replace(/\//g, '');
        if (rest.length > 3) candidates.push(rest);
      }
    });

    // Deduplicate
    return [...new Set(candidates)];
  }, []);

  // ── Key fields to prioritize for matching ──
  const PRIORITY_FIELDS = [
    'nCommande', 'nCommandeAvance', 'nBillet', 'codeBarres',
    'ticketsNumber', 'id',
  ];

  // ── Lookup logic: match scanned code against ALL ticket fields ──
  const findTicketByCode = useCallback(
    (code) => {
      if (!code) return null;
      const candidates = extractCodes(code);
      if (candidates.length === 0) return null;

      // PASS 1: Exact match on priority fields
      for (const candidate of candidates) {
        const found = tickets.find((t) => {
          for (const field of PRIORITY_FIELDS) {
            const val = String(t[field] ?? '').trim();
            if (val && val === candidate) return true;
          }
          return false;
        });
        if (found) return found;
      }

      // PASS 2: Exact match on ANY string field in the ticket object
      // (catches raw Excel column names that weren't mapped to schema fields)
      for (const candidate of candidates) {
        const found = tickets.find((t) => {
          return Object.values(t).some((val) => {
            if (val === null || val === undefined) return false;
            const strVal = String(val).trim();
            return strVal && strVal === candidate;
          });
        });
        if (found) return found;
      }

      // PASS 3: Contained match — the scanned code contains a ticket identifier
      // or a ticket identifier contains the scanned code
      // Only for candidates that look like identifiers (6+ chars, alphanumeric)
      for (const candidate of candidates) {
        if (candidate.length < 6) continue;
        const found = tickets.find((t) => {
          for (const field of PRIORITY_FIELDS) {
            const val = String(t[field] ?? '').trim();
            if (val && val.length >= 6) {
              if (candidate.includes(val) || val.includes(candidate)) return true;
            }
          }
          return false;
        });
        if (found) return found;
      }

      return null;
    },
    [tickets, extractCodes]
  );

  // ── Process a scanned code ──
  const processCode = useCallback(
    async (code) => {
      if (cooldownRef.current) return;
      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
      }, 1500);

      const ticket = findTicketByCode(code);
      const now = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      if (!ticket) {
        const result = { status: STATUS.NOT_FOUND, code, time: now, ticket: null };
        setScanResult(result);
        setHistory((prev) => [result, ...prev]);
        if (soundEnabled) playBeep('error');
        return;
      }

      if (Number(ticket.composte) === 1) {
        const result = { status: STATUS.ALREADY, code, time: now, ticket };
        setScanResult(result);
        setHistory((prev) => [result, ...prev]);
        if (soundEnabled) playBeep('already');
        return;
      }

      // Check-in the ticket
      await toggleCompost(ticket.id, 0);
      const result = { status: STATUS.SUCCESS, code, time: now, ticket };
      setScanResult(result);
      setHistory((prev) => [result, ...prev]);
      if (soundEnabled) playBeep('success');
    },
    [findTicketByCode, toggleCompost, soundEnabled]
  );

  // ── Start camera scanner ──
  const startScanner = useCallback(async () => {
    if (scannerInstanceRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode('scanner-viewport');
      scannerInstanceRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          processCode(decodedText);
        },
        () => {
          // Ignore QR scan errors (no QR found in frame)
        }
      );
      setScanning(true);
    } catch (err) {
      console.error('Scanner start error:', err);
      setScanResult({
        status: STATUS.ERROR,
        code: '',
        time: '',
        ticket: null,
        errorMessage:
          'Impossible d\'accéder à la caméra. Vérifiez les permissions.',
      });
    }
  }, [processCode]);

  // ── Stop camera scanner ──
  const stopScanner = useCallback(async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
      } catch {
        // already stopped
      }
      scannerInstanceRef.current.clear();
      scannerInstanceRef.current = null;
    }
    setScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.stop().catch(() => {});
        scannerInstanceRef.current = null;
      }
    };
  }, []);

  // ── Manual code submit ──
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processCode(manualCode.trim());
      setManualCode('');
    }
  };

  // ── Clear results ──
  const clearResult = () => setScanResult(null);

  // ── Result card config ──
  const getResultConfig = (status) => {
    switch (status) {
      case STATUS.SUCCESS:
        return {
          icon: CheckCircle,
          title: 'Check-in Réussi !',
          color: 'var(--color-success)',
          bgGlow: 'rgba(52, 211, 153, 0.08)',
          borderColor: 'rgba(52, 211, 153, 0.30)',
          gradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.12) 0%, rgba(52, 211, 153, 0.03) 100%)',
        };
      case STATUS.ALREADY:
        return {
          icon: AlertTriangle,
          title: 'Déjà Composté',
          color: 'var(--color-warning)',
          bgGlow: 'rgba(251, 191, 36, 0.06)',
          borderColor: 'rgba(251, 191, 36, 0.25)',
          gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.10) 0%, rgba(251, 191, 36, 0.02) 100%)',
        };
      case STATUS.NOT_FOUND:
        return {
          icon: XCircle,
          title: 'Billet Introuvable',
          color: 'var(--color-danger)',
          bgGlow: 'rgba(251, 113, 133, 0.06)',
          borderColor: 'rgba(251, 113, 133, 0.25)',
          gradient: 'linear-gradient(135deg, rgba(251, 113, 133, 0.10) 0%, rgba(251, 113, 133, 0.02) 100%)',
        };
      case STATUS.ERROR:
        return {
          icon: XCircle,
          title: 'Erreur',
          color: 'var(--color-danger)',
          bgGlow: 'rgba(251, 113, 133, 0.06)',
          borderColor: 'rgba(251, 113, 133, 0.25)',
          gradient: 'linear-gradient(135deg, rgba(251, 113, 133, 0.10) 0%, rgba(251, 113, 133, 0.02) 100%)',
        };
      default:
        return null;
    }
  };

  return (
    <PageWrapper id="scanner-page">
      <div className="page-grid">
        {/* Header */}
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <h2 className="text-xl font-bold flex-row items-center gap-2">
            <ScanLine size={24} className="text-primary" style={{ color: 'var(--color-accent)' }} />
            Scanner Check-in
          </h2>
          <div className="flex-row gap-3">
            <button
              id="scanner-sound-toggle"
              className="scanner-toggle-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
            >
              <Volume2 size={18} style={{ opacity: soundEnabled ? 1 : 0.3 }} />
            </button>
          </div>
        </div>

        {/* Session Stats Bar */}
        <div className="scanner-stats-bar">
          <div className="scanner-stat">
            <Zap size={16} style={{ color: 'var(--color-accent)' }} />
            <span className="scanner-stat-value">{sessionStats.total}</span>
            <span className="scanner-stat-label">Scans</span>
          </div>
          <div className="scanner-stat">
            <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
            <span className="scanner-stat-value" style={{ color: 'var(--color-success)' }}>
              {sessionStats.success}
            </span>
            <span className="scanner-stat-label">Check-ins</span>
          </div>
          <div className="scanner-stat">
            <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
            <span className="scanner-stat-value" style={{ color: 'var(--color-warning)' }}>
              {sessionStats.already}
            </span>
            <span className="scanner-stat-label">Déjà fait</span>
          </div>
          <div className="scanner-stat">
            <XCircle size={16} style={{ color: 'var(--color-danger)' }} />
            <span className="scanner-stat-value" style={{ color: 'var(--color-danger)' }}>
              {sessionStats.notFound}
            </span>
            <span className="scanner-stat-label">Introuvables</span>
          </div>
        </div>

        {/* Main Scanner Area */}
        <div className="scanner-layout">
          {/* Left: Camera + Manual Input */}
          <div className="scanner-camera-section">
            {/* Camera Viewport */}
            <div className="scanner-viewport-wrapper">
              <div className="scanner-viewport-container">
                <div id="scanner-viewport" className="scanner-viewport" />
                {!scanning && (
                  <div className="scanner-placeholder">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="scanner-placeholder-content"
                    >
                      <Camera size={48} style={{ color: 'var(--color-accent)', opacity: 0.6 }} />
                      <p className="text-secondary text-sm" style={{ marginTop: 'var(--space-3)' }}>
                        Appuyez pour activer la caméra
                      </p>
                    </motion.div>
                  </div>
                )}
                {/* Animated scan line */}
                {scanning && (
                  <div className="scanner-scanline-overlay">
                    <motion.div
                      className="scanner-scanline"
                      animate={{ y: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                )}
                {/* Corner brackets */}
                <div className="scanner-corners">
                  <span className="corner tl" />
                  <span className="corner tr" />
                  <span className="corner bl" />
                  <span className="corner br" />
                </div>
              </div>

              {/* Camera Controls */}
              <div className="scanner-controls">
                {!scanning ? (
                  <motion.button
                    id="scanner-start-btn"
                    className="scanner-action-btn scanner-action-start"
                    onClick={startScanner}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Camera size={20} />
                    Démarrer le Scanner
                  </motion.button>
                ) : (
                  <motion.button
                    id="scanner-stop-btn"
                    className="scanner-action-btn scanner-action-stop"
                    onClick={stopScanner}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <CameraOff size={20} />
                    Arrêter le Scanner
                  </motion.button>
                )}
              </div>
            </div>

            {/* Manual Code Input */}
            <form className="scanner-manual-form" onSubmit={handleManualSubmit}>
              <div className="scanner-manual-input-wrapper">
                <Hash size={16} className="scanner-manual-icon" />
                <input
                  id="scanner-manual-input"
                  className="form-input scanner-manual-input"
                  type="text"
                  placeholder="Saisir le code manuellement (N° Commande / Billet)..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
              </div>
              <motion.button
                id="scanner-manual-submit"
                type="submit"
                className="scanner-action-btn scanner-action-manual"
                disabled={!manualCode.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <ShieldCheck size={18} />
                Vérifier
              </motion.button>
            </form>
          </div>

          {/* Right: Result + History */}
          <div className="scanner-result-section">
            {/* Result Card */}
            <AnimatePresence mode="wait">
              {scanResult ? (
                <motion.div
                  key={scanResult.code + scanResult.time}
                  className="scanner-result-card"
                  style={{
                    '--result-color': getResultConfig(scanResult.status)?.color,
                    '--result-glow': getResultConfig(scanResult.status)?.bgGlow,
                    '--result-border': getResultConfig(scanResult.status)?.borderColor,
                    background: getResultConfig(scanResult.status)?.gradient,
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className="scanner-result-header">
                    <motion.div
                      className="scanner-result-icon-ring"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                    >
                      {(() => {
                        const config = getResultConfig(scanResult.status);
                        const IconComp = config.icon;
                        return <IconComp size={32} style={{ color: config.color }} />;
                      })()}
                    </motion.div>
                    <div className="scanner-result-title-block">
                      <h3 className="scanner-result-title">
                        {getResultConfig(scanResult.status)?.title}
                      </h3>
                      <span className="scanner-result-code">{scanResult.code}</span>
                    </div>
                    <button
                      className="scanner-result-close"
                      onClick={clearResult}
                      title="Fermer"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>

                  {/* Ticket Details */}
                  {scanResult.ticket && (
                    <motion.div
                      className="scanner-result-details"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="scanner-detail-row">
                        <User size={14} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                        <span className="scanner-detail-label">Participant</span>
                        <span className="scanner-detail-value">
                          {scanResult.ticket.prenomParticipant} {scanResult.ticket.nomParticipant}
                        </span>
                      </div>
                      <div className="scanner-detail-row">
                        <Ticket size={14} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                        <span className="scanner-detail-label">Catégorie</span>
                        <span className="scanner-detail-value">
                          {scanResult.ticket.categorieFamille || '—'}
                          {scanResult.ticket.tarif ? ` · ${scanResult.ticket.tarif}` : ''}
                        </span>
                      </div>
                      <div className="scanner-detail-row">
                        <Hash size={14} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                        <span className="scanner-detail-label">Typologie</span>
                        <span className="scanner-detail-value">
                          {scanResult.ticket.typologie || '—'}
                        </span>
                      </div>
                      <div className="scanner-detail-row">
                        <Clock size={14} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                        <span className="scanner-detail-label">Statut</span>
                        <Badge category={scanResult.ticket.statutBillet || 'N/A'} />
                      </div>
                    </motion.div>
                  )}

                  {scanResult.status === STATUS.ERROR && (
                    <p className="text-sm" style={{ color: 'var(--color-danger)', padding: '0 var(--space-5) var(--space-5)' }}>
                      {scanResult.errorMessage}
                    </p>
                  )}

                  {scanResult.status === STATUS.NOT_FOUND && (
                    <div style={{ padding: '0 var(--space-6) var(--space-5)' }}>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)', fontFamily: "'SF Mono', 'Cascadia Code', monospace", wordBreak: 'break-all', background: 'rgba(255,255,255,0.02)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                        Donnée QR brute : {scanResult.code}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty-result"
                  className="scanner-result-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ScanLine size={40} style={{ color: 'var(--color-text-tertiary)' }} />
                  <p className="text-secondary text-sm" style={{ marginTop: 'var(--space-3)' }}>
                    En attente d'un scan...
                  </p>
                  <p className="text-tertiary text-xs" style={{ marginTop: 'var(--space-1)' }}>
                    Scannez un QR code ou saisissez le numéro manuellement
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History */}
            <div className="scanner-history">
              <div className="scanner-history-header">
                <h3 className="scanner-history-title">
                  <Clock size={16} style={{ color: 'var(--color-accent)' }} />
                  Historique de Session
                </h3>
                {history.length > 0 && (
                  <button
                    className="scanner-history-clear"
                    onClick={() => setHistory([])}
                  >
                    Effacer
                  </button>
                )}
              </div>
              <div className="scanner-history-list">
                {history.length === 0 ? (
                  <p className="text-tertiary text-xs" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                    Aucun scan enregistré dans cette session
                  </p>
                ) : (
                  <AnimatePresence initial={false}>
                    {history.slice(0, 50).map((item, index) => {
                      const config = getResultConfig(item.status);
                      const IconComp = config.icon;
                      return (
                        <motion.div
                          key={`${item.code}-${item.time}-${index}`}
                          className="scanner-history-item"
                          initial={{ opacity: 0, x: -20, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                          <IconComp size={16} style={{ color: config.color, flexShrink: 0 }} />
                          <div className="scanner-history-item-content">
                            <span className="scanner-history-item-code">{item.code}</span>
                            {item.ticket && (
                              <span className="scanner-history-item-name">
                                {item.ticket.prenomParticipant} {item.ticket.nomParticipant}
                              </span>
                            )}
                          </div>
                          <span className="scanner-history-item-time">{item.time}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
