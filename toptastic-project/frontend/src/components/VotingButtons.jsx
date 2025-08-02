import { useState, useEffect } from 'react';
import { voterSystem } from '../utils/voterSystem';
import { api } from '../utils/api';
import Icons from './Icons';

function VotingButtons({ 
  itemId, 
  initialLikes = 0, 
  initialDislikes = 0, 
  onVoteChange,
  size = 'medium'
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya votó por este item
    const localVote = voterSystem.getLocalVoteForItem(itemId);
    if (localVote) {
      setUserVote(localVote.voteType);
    }
  }, [itemId]);

  const handleVote = async (voteType) => {
    if (isVoting) return;
    
    setIsVoting(true);
    const voterId = voterSystem.getVoterId();

    try {
      if (userVote === voteType) {
        // Si ya votó lo mismo, quitar el voto
        await api.removeVote(itemId, voterId);
        
        // Actualizar estado local
        if (voteType === 'like') {
          setLikes(prev => Math.max(0, prev - 1));
        } else {
          setDislikes(prev => Math.max(0, prev - 1));
        }
        
        setUserVote(null);
        voterSystem.removeLocalVote(itemId);
        
      } else {
        // Votar o cambiar voto
        await api.voteItem(itemId, voteType, voterId);
        
        // Actualizar estado local
        if (userVote) {
          // Cambiar voto existente
          if (userVote === 'like') {
            setLikes(prev => Math.max(0, prev - 1));
          } else {
            setDislikes(prev => Math.max(0, prev - 1));
          }
        }
        
        if (voteType === 'like') {
          setLikes(prev => prev + 1);
        } else {
          setDislikes(prev => prev + 1);
        }
        
        setUserVote(voteType);
        voterSystem.setLocalVote(itemId, voteType);
      }

      // Notificar al componente padre
      if (onVoteChange) {
        onVoteChange(itemId, { likes, dislikes, userVote });
      }

    } catch (error) {
      console.error('Error voting:', error);
      // Revertir cambios en caso de error
      setLikes(initialLikes);
      setDislikes(initialDislikes);
      setUserVote(voterSystem.getLocalVoteForItem(itemId)?.voteType || null);
    } finally {
      setIsVoting(false);
    }
  };

  const buttonSize = {
    small: { padding: '0.25rem 0.4rem', fontSize: '0.75rem' },
    compact: { padding: '0.3rem 0.5rem', fontSize: '0.8rem' },
    medium: { padding: '0.5rem 0.75rem', fontSize: '0.9rem' },
    large: { padding: '0.75rem 1rem', fontSize: '1rem' }
  }[size];

  return (
    <div 
      className="voting-buttons"
      style={{ 
        display: 'flex', 
        gap: '0.5rem',
        alignItems: 'center'
      }}
    >
      {/* Botón Like */}
      <button 
        onClick={() => handleVote('like')}
        disabled={isVoting}
        className={`vote-btn like-btn ${userVote === 'like' ? 'active' : ''}`}
        style={{
          ...buttonSize,
          background: userVote === 'like' 
            ? 'linear-gradient(135deg, var(--pico-primary-500) 0%, var(--pico-primary-600) 100%)'
            : 'var(--pico-card-background-color)',
          color: userVote === 'like' ? 'white' : 'var(--pico-color)',
          border: `2px solid ${userVote === 'like' ? 'var(--pico-primary-500)' : 'var(--pico-muted-border-color)'}`,
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          cursor: isVoting ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          transform: isVoting ? 'scale(0.95)' : 'scale(1)'
        }}
      >
        {isVoting && userVote === 'like' ? '⏳' : <Icons.Like liked={userVote === 'like'} />}
        {likes}
      </button>

      {/* Botón Dislike */}
      <button 
        onClick={() => handleVote('dislike')}
        disabled={isVoting}
        className={`vote-btn dislike-btn ${userVote === 'dislike' ? 'active' : ''}`}
        style={{
          ...buttonSize,
          background: userVote === 'dislike' 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'var(--pico-card-background-color)',
          color: userVote === 'dislike' ? 'white' : 'var(--pico-color)',
          border: `2px solid ${userVote === 'dislike' ? '#ef4444' : 'var(--pico-muted-border-color)'}`,
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          cursor: isVoting ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          transform: isVoting ? 'scale(0.95)' : 'scale(1)'
        }}
      >
        {isVoting && userVote === 'dislike' ? '⏳' : '👎'}
        {dislikes}
      </button>
    </div>
  );
}

export default VotingButtons;
