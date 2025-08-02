import { useState, useEffect } from 'react';
import { api } from '../utils/api';

function VotingStats({ listId, refreshTrigger = 0 }) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, [listId, refreshTrigger]);

  const loadStats = async () => {
    setLoading(true);
    setError('');

    try {
      const [topVotedResponse, activityResponse] = await Promise.all([
        api.getTopVoted(listId, 5),
        api.getVotingActivity(listId, 24)
      ]);

      if (topVotedResponse.success) {
        setStats(topVotedResponse.data);
      }

      if (activityResponse.success) {
        setActivity(activityResponse.data);
      }

    } catch (err) {
      setError('Error cargando estadísticas');
      console.error('Error loading voting stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="voting-stats-loading" style={{ padding: '1rem', textAlign: 'center' }}>
        <p>📊 Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voting-stats-error" style={{ padding: '1rem', color: 'var(--pico-del-color)' }}>
        <p>{error}</p>
      </div>
    );
  }

  const totalVotes = activity.length;
  const recentLikes = activity.filter(vote => vote.vote_type === 'like').length;
  const recentDislikes = activity.filter(vote => vote.vote_type === 'dislike').length;

  
}

export default VotingStats;
