import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorResponse from '../ErrorResponse/errorResponse';
import Loader from '../Loader/loader';
import './createGame.css';

const serverUrl: string = import.meta.env.VITE_BASE_REST_API_URL;
const serverErrorMsg = "We're sorry, but there was a problem processing your request. Please try after sometime...";

const CreateGame = () => {
  const [playerName, setPlayerName] = useState('');
  const [isServerError, setServerError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleCreateGameSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitGame();
  };

  const handlePlayerName = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  //sending post request to server to create a game
  const submitGame = async () => {
    setIsLoading(true);
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: playerName,
    };
    try {
      const response = await fetch(serverUrl, config);
      if (response.ok) {
        const data = await response.json();
        const { dealer, gameId, inviteUrl } = data;
        setPlayerName('');
        localStorage.setItem('inviteUrl', inviteUrl);
        navigate(`/game/invite/${gameId}?playerId=${dealer.id}`);
      }
    } catch (error) {
      setServerError(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="create-game-main-container">
      {isLoading && <Loader />}
      {!isServerError && !isLoading && (
        <form className="create-game-form-container" onSubmit={handleCreateGameSubmit}>
          <input type="text" placeholder="Enter your Name" className="player-name" value={playerName} onChange={handlePlayerName} required />
          <button className="custom-game-btn" type="submit">
            Create Game
          </button>
        </form>
      )}
      {isServerError && <ErrorResponse errorMsg={serverErrorMsg} />}
    </div>
  );
};

export default CreateGame;
