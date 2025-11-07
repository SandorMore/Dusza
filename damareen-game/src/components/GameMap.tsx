import React, { useState } from 'react';
import type { Dungeon, Deck, PlayerCollection, BattleResult } from '../types/types';
import BattleView from './../components/BattleView';
import './GameMap.css';

interface GameMapProps {
  dungeons: Dungeon[];
  playerDecks: Deck[];
  playerCollection: PlayerCollection;
  onDeckUpdate: (deck: Deck) => void;
  onCardUpgrade: (cardId: string, type: 'damage' | 'health', value: number) => void;
}

const GameMap: React.FC<GameMapProps> = ({
  dungeons,
  playerDecks,
  playerCollection,
  onDeckUpdate,
  onCardUpgrade
}) => {
  const [currentView, setCurrentView] = useState<'map' | 'battle'>('map');
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(playerDecks[0] || null);

  const startBattle = (dungeon: Dungeon, deck: Deck) => {
    if (deck.cards.length !== dungeon.cards.length) {
      alert(`A pakli (${deck.cards.length}) és a kazamata (${dungeon.cards.length}) kártyaszáma nem egyezik!`);
      return;
    }

    setSelectedDungeon(dungeon);
    setSelectedDeck(deck);
    setCurrentView('battle');
  };

  const handleBattleEnd = (result: BattleResult) => {
    if (result.winner === 'player' && selectedDungeon) {
      const reward = selectedDungeon.reward;
      // Egyszerűsített nyeremény - első kártya kapja
      if (selectedDeck && selectedDeck.cards.length > 0) {
        onCardUpgrade(selectedDeck.cards[0].id, reward.type, reward.value);
      }
      alert(`Győzelem! ${reward.value} ${reward.type === 'damage' ? 'sebzés' : 'életerő'} nyeremény!`);
    } else if (result.winner === 'dungeon') {
      alert('Vereség! Próbáld újra más paklival!');
    }
    setCurrentView('map');
  };

  if (currentView === 'battle' && selectedDungeon && selectedDeck) {
    return (
      <BattleView
        playerDeck={selectedDeck.cards}
        dungeon={selectedDungeon}
        onBattleEnd={handleBattleEnd}
        onExit={() => setCurrentView('map')}
      />
    );
  }

  return (
    <div className="game-map">
      <div className="map-header">
        <h1>DAMAREEN - Kazamaták</h1>
        <div className="player-info">
          <span>Gyűjtemény: {playerCollection.cards.length} kártya</span>
          <span>Paklik: {playerDecks.length}</span>
        </div>
      </div>

      <div className="dungeon-path">
        {dungeons.map((dungeon, index) => (
          <div key={dungeon.id} className="path-node">
            {index > 0 && <div className="path-connector" />}
            
            <div className="dungeon-node">
              <div className={`node-icon ${dungeon.type}`}>
                {dungeon.type === 'egyszerű' && '⚔️'}
                {dungeon.type === 'kis' && '🏰'}  
                {dungeon.type === 'nagy' && '👑'}
              </div>
              
              <div className="node-info">
                <h3>{dungeon.name}</h3>
                <div className="dungeon-details">
                  <span>{dungeon.cards.length} kártya</span>
                  <span className={`difficulty ${dungeon.type}`}>
                    {dungeon.type}
                  </span>
                  <span className="reward-info">
                    Nyeremény: +{dungeon.reward.value} {dungeon.reward.type === 'damage' ? '⚔️' : '❤️'}
                  </span>
                </div>
                
                <div className="deck-selector">
                  <select 
                    value={selectedDeck?.id || ''}
                    onChange={(e) => {
                      const deck = playerDecks.find(d => d.id === e.target.value);
                      if (deck) setSelectedDeck(deck);
                    }}
                    className="deck-dropdown"
                  >
                    <option value="">Válassz paklit...</option>
                    {playerDecks.map(deck => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name} ({deck.cards.length} kártya)
                      </option>
                    ))}
                  </select>
                  
                  <button
                    className="battle-start-btn"
                    onClick={() => selectedDeck && startBattle(dungeon, selectedDeck)}
                    disabled={!selectedDeck}
                  >
                    Harc indítása
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDeck && (
        <div className="current-deck-info">
          <h4>Aktuális pakli: {selectedDeck.name}</h4>
          <div className="deck-cards-preview">
            {selectedDeck.cards.slice(0, 5).map(card => (
              <div key={card.id} className="mini-card">
                <span className="card-name">{card.name}</span>
                <span className="card-stats">{card.damage}⚔️/{card.health}❤️</span>
              </div>
            ))}
            {selectedDeck.cards.length > 5 && (
              <div className="mini-card more">+{selectedDeck.cards.length - 5}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMap;