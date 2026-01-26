import React, { useState } from 'react';

const InteractiveCard = ({ formData }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const {
    name = '',
    monthlySpend = 0,
  } = formData || {};

  const formatCardNumber = () => {
    return '**** **** **** 1234';
  };

  const getExpiryDate = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear() + 3).slice(-2);
    return `${month}/${year}`;
  };

  const getCardTier = () => {
    const spend = parseFloat(monthlySpend) || 0;
    if (spend > 100000) return 'Platinum';
    if (spend > 50000) return 'Gold';
    if (spend > 25000) return 'Silver';
    return 'Classic';
  };

  const getDisplayName = () => {
    if (!name || name.trim() === '') return 'CARDHOLDER NAME';
    return name.toUpperCase().substring(0, 22);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div style={styles.container}>
      <style>{keyframesCSS}</style>

      <div
        style={{
          ...styles.cardWrapper,
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={handleCardClick}
      >
        {/* Front of Card */}
        <div style={styles.cardFront}>
          <div style={styles.shimmerOverlay} />
          <div style={styles.radialGlow} />

          <div style={styles.cardContent}>
            <div style={styles.cardHeader}>
              <div style={styles.cardChip}>
                <div style={styles.chipInner} />
                <div style={styles.chipGloss} />
              </div>
              <div style={styles.cardLogo}>
                <div style={styles.circle1} />
                <div style={styles.circle2} />
              </div>
            </div>

            <div>
              <div style={styles.contactlessIcon}>
                <div style={styles.contactlessInner} />
                <div style={styles.contactlessOuter} />
              </div>
              <div style={styles.cardNumber}>{formatCardNumber()}</div>
            </div>

            <div style={styles.cardFooter}>
              <div style={styles.cardInfo}>
                <div style={styles.cardLabel}>Card Holder</div>
                <div style={styles.cardValue}>{getDisplayName()}</div>
              </div>

              <div style={styles.cardInfo}>
                <div style={styles.cardLabel}>Expires</div>
                <div style={styles.cardValue}>{getExpiryDate()}</div>
              </div>
            </div>
          </div>

          <div style={styles.cardTypeIndicator}>{getCardTier()}</div>
        </div>

        {/* Back of Card */}
        <div style={styles.cardBack}>
          <div style={styles.magneticStripe} />
          <div style={styles.signatureStrip}>
            <div style={styles.cvvLabel}>CVV</div>
            <div style={styles.cvvBox} />
          </div>
          <div style={styles.backFooter}>
            This card is property of the issuing bank. If found, please return to the nearest branch.
            For customer service, call 1800-XXX-XXXX or visit our website.
          </div>
        </div>
      </div>

      <div style={styles.flipIndicator}>
        Click to flip card
      </div>
    </div>
  );
};

const keyframesCSS = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4),
                  0 0 40px rgba(99, 102, 241, 0.2),
                  0 40px 100px rgba(0, 0, 0, 0.5);
    }
    50% {
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.6),
                  0 0 60px rgba(139, 92, 246, 0.3),
                  0 40px 100px rgba(0, 0, 0, 0.5);
    }
  }
`;

const styles = {
  container: {
    perspective: '1500px',
    width: '100%',
    maxWidth: '380px',
    position: 'sticky',
    top: '120px',
    transition: 'all 0.3s ease',
    animation: 'float 6s ease-in-out infinite',
  },

  cardWrapper: {
    position: 'relative',
    width: '100%',
    height: '200px',
    transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    transformStyle: 'preserve-3d',
    cursor: 'pointer',
  },

  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: '20px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    animation: 'glow 4s ease-in-out infinite',
  },

  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s infinite',
    pointerEvents: 'none',
  },

  radialGlow: {
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    opacity: 0.5,
    pointerEvents: 'none',
  },

  cardContent: {
    position: 'relative',
    zIndex: 1,
    padding: '28px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  cardChip: {
    width: '50px',
    height: '38px',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    borderRadius: '8px',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },

  chipInner: {
    position: 'absolute',
    top: '6px',
    left: '6px',
    right: '6px',
    bottom: '6px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  },

  chipGloss: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    height: '60%',
    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
  },

  cardLogo: {
    display: 'flex',
    gap: '8px',
  },

  circle1: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(235, 0, 27, 0.8)',
    opacity: 0.9,
  },

  circle2: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255, 95, 0, 0.8)',
    marginLeft: '-12px',
    opacity: 0.9,
  },

  contactlessIcon: {
    position: 'relative',
    width: '24px',
    height: '24px',
    marginBottom: '8px',
  },

  contactlessInner: {
    position: 'absolute',
    width: '16px',
    height: '16px',
    top: '4px',
    left: '4px',
    border: '2px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    borderRight: 'transparent',
    borderBottom: 'transparent',
    transform: 'rotate(45deg)',
  },

  contactlessOuter: {
    position: 'absolute',
    width: '24px',
    height: '24px',
    top: 0,
    left: 0,
    border: '2px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    borderRight: 'transparent',
    borderBottom: 'transparent',
    transform: 'rotate(45deg)',
    opacity: 0.6,
  },

  cardNumber: {
    fontSize: '24px',
    fontWeight: 500,
    letterSpacing: '4px',
    color: 'white',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    fontFamily: '"Courier New", monospace',
    margin: '20px 0',
    userSelect: 'none',
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  cardLabel: {
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 600,
  },

  cardValue: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },

  cardTypeIndicator: {
    position: 'absolute',
    top: '12px',
    right: '28px',
    padding: '4px 12px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 700,
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    zIndex: 2,
  },

  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: '20px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    transform: 'rotateY(180deg)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
  },

  magneticStripe: {
    width: '100%',
    height: '50px',
    background: 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)',
    margin: '24px 0',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
  },

  signatureStrip: {
    background: 'white',
    height: '40px',
    margin: '0 28px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    position: 'relative',
    justifyContent: 'space-between',
  },

  cvvLabel: {
    color: '#666',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },

  cvvBox: {
    width: '50px',
    height: '20px',
    background: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '2px',
  },

  backFooter: {
    padding: '20px 28px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '9px',
    lineHeight: 1.4,
    textAlign: 'center',
  },

  flipIndicator: {
    position: 'absolute',
    bottom: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    userSelect: 'none',
  },
};

export default InteractiveCard;