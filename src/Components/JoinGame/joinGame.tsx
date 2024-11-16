import React, { FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StompService from '../../StompService/stompService';
import { PlayerResponse, WebSocketProps } from '../../types/types';
import './joinGame.css';

const serverUrl = import.meta.env.VITE_BASE_REST_API_URL;

const JoinGame: React.FC<WebSocketProps> = ({ isWebSocketConnected }) => {
  const { gameId } = useParams(); // Getting the game ID from the URL
  const [playerName, setPlayerName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>('');
  const stompService = StompService.getInstance();
  const navigate = useNavigate();

  // This function handles the "Join Game" button click
  const onHandleJoinGameButton = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (playerName.trim() === '') {
      setErrorMsg("Name can't be empty");
      return;
    }

    try {
      // Make a POST request to join the game with the given player name
      const response = await fetch(`${serverUrl}/${gameId}`, {
        method: 'POST',
        headers: {
          'Content-type': 'Application/json',
        },
        body: playerName,
      });
      if (!response.ok) {
        const data: PlayerResponse = await response.json();
        setErrorMsg(data.errorMsg);
      } else {
        const data: PlayerResponse = await response.json();
        if (isWebSocketConnected) {
          stompService.sendMessage(`/game/join/${gameId}`, playerName);
        }
        navigate(`/game/lobby/${gameId}?playerId=${data.player.id}`);
        setErrorMsg('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="join-game-container">
      <div className="join-game-content">
        <form className="join-game-input-container" onSubmit={onHandleJoinGameButton}>
          <input
            type="text"
            className="join-game-input"
            placeholder="Enter Your Name"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
          />
          <button type="submit" className="join-game-button">
            Join Game
          </button>
          {errorMsg && <p className="error-message">*{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
};

export default JoinGame;
