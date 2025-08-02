// Sistema de votante anónimo persistente
class VoterSystem {
  constructor() {
    this.storageKey = 'toptastic_voter_id';
    this.voterId = this.getOrCreateVoterId();
  }

  getOrCreateVoterId() {
    // Intentar obtener ID existente
    let voterId = localStorage.getItem(this.storageKey);
    
    if (!voterId) {
      // Crear nuevo ID único
      voterId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.storageKey, voterId);
    }
    
    return voterId;
  }

  getVoterId() {
    return this.voterId;
  }

  // Para debug o reset
  resetVoterId() {
    localStorage.removeItem(this.storageKey);
    this.voterId = this.getOrCreateVoterId();
    return this.voterId;
  }

  // Obtener votos locales guardados (para UI optimista)
  getLocalVotes() {
    const votes = localStorage.getItem('toptastic_local_votes');
    return votes ? JSON.parse(votes) : {};
  }

  setLocalVote(itemId, voteType) {
    const votes = this.getLocalVotes();
    votes[itemId] = { voteType, timestamp: Date.now() };
    localStorage.setItem('toptastic_local_votes', JSON.stringify(votes));
  }

  removeLocalVote(itemId) {
    const votes = this.getLocalVotes();
    delete votes[itemId];
    localStorage.setItem('toptastic_local_votes', JSON.stringify(votes));
  }

  getLocalVoteForItem(itemId) {
    const votes = this.getLocalVotes();
    return votes[itemId] || null;
  }
}

// Instancia singleton
export const voterSystem = new VoterSystem();

export default VoterSystem;
