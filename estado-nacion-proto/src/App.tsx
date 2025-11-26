import { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Dashboard } from './components/Dashboard';
import { NewGameSetup } from './components/NewGameSetup';
import { MinisterSelectionPage } from './components/MinisterSelectionPage';
import { MainMenu } from './components/MainMenu';
import { AudioProvider } from './context/AudioContext';

const GameApp = () => {
  const { state } = useGame();
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [cabinetComplete, setCabinetComplete] = useState(false);

  // Watch for cabinet completion
  useEffect(() => {
    if (state.gameStarted && state.government.ministers.length === 8) {
      setCabinetComplete(true);
    }
  }, [state.gameStarted, state.government.ministers.length]);

  // Hide main menu when game starts (from load or new game)
  useEffect(() => {
    if (state.gameStarted) {
      setShowMainMenu(false);
    }
  }, [state.gameStarted]);

  // Show main menu first
  if (showMainMenu && !state.gameStarted) {
    return <MainMenu onNewGame={() => setShowMainMenu(false)} />;
  }

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
    <AudioProvider>
      <GameProvider>
        <GameApp />
      </GameProvider>
    </AudioProvider>
  );
}

export default App;


