import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StompService from '../../StompService/stompService';
import { Player, Role, WebSocketProps } from '../../types/types';
import ErrorResponse from '../ErrorResponse/errorResponse';
import Loader from '../Loader/loader';
import './gameLobby.css';

const serverUrl: string = import.meta.env.VITE_BASE_REST_API_URL;
const maxPlayers: number = 6;
const serverErrorMsg = "We're sorry, but there was a problem processing your request. Please try after sometime...";

const defaultPlayer: Player = {
  id: 'p1',
  name: 'player',
  role: Role.EMPLOYEE,
  scores: [],
};

const GameLobby: React.FC<WebSocketProps> = ({ isWebSocketConnected }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [waitingPlayersCount, setWaitingPlayersCount] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(defaultPlayer);
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [isServerError, setServerError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { gameId } = useParams();
  const location = useLocation();
  const { search } = location;
  const searchParams = new URLSearchParams(search);
  const playerId = searchParams.get('playerId');
  const navigate = useNavigate();
  const stompService: StompService = StompService.getInstance();

  useEffect(() => {
    getGameDetails();
  }, []);

  useEffect(() => {
    if (isWebSocketConnected) {
      subscribeToJoin();
    }
  }, [isWebSocketConnected, gameId]);

  const subscribeToJoin = () => {
    stompService.subscribe(`/topics/lobby/${gameId}`, (message) => {
      const updatedPlayers = JSON.parse(message.body);
      setPlayers(updatedPlayers);
      setWaitingPlayersCount(maxPlayers - updatedPlayers.length);
    });
    stompService.subscribe(`/topics/gameplay/${gameId}`, () => {
      navigate(`/game/dealer/${gameId}?playerId=${playerId}`);
    });
  };

  const getGameDetails = async () => {
    const finalUrl = `${serverUrl}/${gameId}`;
    setIsLoading(true);
    try {
      const response = await fetch(finalUrl);
      if (response.ok) {
        const data = await response.json();
        const currentPlayer = data.players.find((eachPlayer: Player) => eachPlayer.id === playerId);

        if (currentPlayer.role === Role.DEALER) {
          setIsModerator(true);
        }

        setPlayers(data.players);
        setCurrentPlayer(currentPlayer);
        setWaitingPlayersCount(maxPlayers - data.players.length);
      } else {
        setServerError(true);
        setErrorMsg('Unable to find the game or access is restricted.');
      }
    } catch (error) {
      setServerError(true);
      setErrorMsg(serverErrorMsg);
    }
    setIsLoading(false);
  };

  const renderPlayerPlaceHolders = () => {
    const placeHolderArray = Array(waitingPlayersCount).fill({ status: 'Waiting...' });

    return placeHolderArray.map((eachPlaceHolder, index) => (
      <div key={`${eachPlaceHolder}-${index}`} className="player-board-container">
        <h2 className="onboard-player-name">{eachPlaceHolder.status}</h2>
      </div>
    ));
  };

  const handleRemovePlayer = async (removePlayerId: string, playerName: string) => {
    setIsLoading(true);
    const config = {
      method: 'DELETE',
    };
    const deleteApiUrl = `${serverUrl}/${gameId}?playerId=${removePlayerId}`;
    try {
      const response = await fetch(deleteApiUrl, config);
      if (response.ok) {
        if (isWebSocketConnected) {
          stompService.sendMessage(`/game/remove/${gameId}`, playerName);
        }
      } else {
        setServerError(true);
        setErrorMsg('Oops! The player you attempted to remove has already been removed or does not exist. Please refresh the player list and try again.');
      }
    } catch (error) {
      setServerError(true);
      setErrorMsg(serverErrorMsg);
    }
    setIsLoading(false);
  };

  const handleTakeOff = () => {
    if (isWebSocketConnected) {
      stompService.sendMessage(`/game/take-off/${gameId}`, '');
    }
  };

  return (
    <div className="game-lobby-main-container">
      {!isLoading && !isServerError && <h1 className="game-lobby-welcome-text">Welcome, {currentPlayer.name}</h1>}
      {isLoading && <Loader />}
      {isServerError && <ErrorResponse errorMsg={errorMsg} />}
      {!isLoading && !isServerError && (
        <div className="players-group-container">
          {players.map((eachPlayer: Player) => (
            <div key={eachPlayer.id} className="player-board-container">
              <h2 className="onboard-player-name">{eachPlayer.name}</h2>
              {!isModerator && eachPlayer.role === 'DEALER' && <p className="highlight-current-player">(Moderator)</p>}
              {currentPlayer.name === eachPlayer.name && <p className="highlight-current-player">(You)</p>}
              {isModerator && eachPlayer.role !== 'DEALER' && (
                <button className="remove-player-btn" onClick={() => handleRemovePlayer(eachPlayer.id, eachPlayer.name)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          {waitingPlayersCount > 0 && renderPlayerPlaceHolders()}
          {isModerator && players.length === maxPlayers && (
            <button className="take-off-btn" onClick={handleTakeOff}>
              Take off
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameLobby;
