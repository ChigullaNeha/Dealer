import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ChatWindow from './components/ChatWindow/chatWindow';
import CreateGame from './components/CreateGame/createGame';
import DealerPage from './Components/DealerPage/dealer';
import GameLobby from './components/GameLobby/gameLobby';
import InvitePlayer from './components/InvitePlayer/invitePlayer';
import JoinGame from './components/JoinGame/joinGame';
import NotFound from './components/NotFound/notFound';
import Score from './components/Score/score';
import StompService from './StompService/stompService';

import BoardAssignment from './components/BoardAssignment/boardAssignment';
import DefaultGame from './components/DefaultGame/defaultGame';

import './App.css';
import Player from './Components/Player/player';

const App = () => {
  const location = useLocation();
  const stompService = StompService.getInstance();
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const pathname = location.pathname;

  const establishWebSocket = () => {
    stompService.connect(
      'http://localhost:8080/ws',
      () => {
        setIsWebSocketConnected(true);
      },
      (error) => {
        console.error('Error connecting:', error);
      },
    );
  };

  useEffect(() => {
    establishWebSocket();
  }, []);

  const renderChatWindow = () => {
    if (pathname !== '/' && !pathname.startsWith('/game/join/') && pathname !== '/not-found') {
      return <ChatWindow isWebSocketConnected={isWebSocketConnected} />;
    }
    return null;
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="main-app-container">
        <Routes>
          <Route path="/" element={<CreateGame />} />
          <Route path="/game/invite/:gameId" element={<InvitePlayer />} />
          <Route path="/game/score/:gameId" element={<Score />} />
          <Route path="/game/join/:gameId" element={<JoinGame isWebSocketConnected={isWebSocketConnected} />} />
          <Route path="/game/dealer/:gameId" element={<DealerPage isWebSocketConnected={isWebSocketConnected} />} />
          <Route path="/game/players/:gameId" element={<Player isWebSocketConnected={isWebSocketConnected} />} />
          <Route path="/game/lobby/:gameId" element={<GameLobby isWebSocketConnected={isWebSocketConnected} />} />
          <Route path="/game/gamePlay/:gameId" element={<BoardAssignment isWebSocketConnected={isWebSocketConnected} />} />
          <Route path="*" element={<Navigate to="/not-found" />} />
          <Route path="/game/default/:gameId" element={<DefaultGame />} />
          <Route path="/not-found" element={<NotFound />} />
        </Routes>
        {renderChatWindow()}
      </div>
    </DndProvider>
  );
};

export default App;
