import { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Dashboard } from './components/Dashboard';
import { NewGameSetup } from './components/NewGameSetup';
import { MinisterSelectionPage } from './components/MinisterSelectionPage';

const GameApp = () => {
  const { state } = useGame();
  const [cabinetComplete, setCabinetComplete] = useState(false);

  // Watch for cabinet completion
  useEffect(() => {
    if (state.gameStarted && state.government.ministers.length === 8) {
      setCabinetComplete(true);
    }
  }, [state.gameStarted, state.government.ministers.length]);

  // Show setup if game hasn't started
  if (!state.gameStarted) {
    return <NewGameSetup />;
  }

  // Show minister selection if cabinet is not complete
  if (!cabinetComplete) {
    return <MinisterSelectionPage />;
  }

  // Show dashboard when everything is ready
  return <Dashboard />;
};

function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}

export default App;


