import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ErrorResponse from '../ErrorResponse/errorResponse';
import Loader from '../Loader/loader';
import './invitePlayer.css';

const serverUrl: string = import.meta.env.VITE_BASE_REST_API_URL;

const serverErrorMsg = "We're sorry, but there was a problem processing your request. Please try after sometime...";
const unknownPlayerMsg = 'We encountered an issue fetching the player data. Please attempt to create the game again.';

const InvitePlayer = () => {
  const [playerName, setPlayerName] = useState('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isServerError, setServerError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopyError, setIsCopyError] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>('');
  const navigate = useNavigate();
  const { gameId } = useParams();
  const inviteUrl = localStorage.getItem('inviteUrl');
  const location = useLocation();
  const { search } = location;
  const searchParams = new URLSearchParams(search);
  const playerId = searchParams.get('playerId');

  useEffect(() => {
    getPlayer();
  }, []);

  const getPlayer = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${serverUrl}/${gameId}/players/${playerId}`);
      if (response.ok) {
        const data = await response.json();
        setPlayerName(data.name);
      } else {
        setServerError(true);
        setErrMsg(unknownPlayerMsg);
      }
    } catch (error) {
      setServerError(true);
      setErrMsg(serverErrorMsg);
    }
    setIsLoading(false);
  };

  //copying link to clipboard
  const onClickCopyLink = async () => {
    try {
      if (inviteUrl) {
        await navigator.clipboard.writeText(inviteUrl);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      }
    } catch (error) {
      setIsCopyError(true);
      setTimeout(() => {
        setIsCopyError(false);
      }, 3000);
    }
  };

  const onClickLobby = () => {
    navigate(`/game/lobby/${gameId}?playerId=${playerId}`);
  };

  return (
    <div className="invite-player-main-container">
      {isLoading && <Loader />}
      {isServerError && <ErrorResponse errorMsg={errMsg} />}
      {!isServerError && !isLoading && (
        <div className="invite-link-container">
          <h1 className="welcome-player-text">Welcome, {playerName}</h1>
          <p className="invite-link-text">{inviteUrl}</p>
          <button className="custom-game-btn" onClick={onClickCopyLink}>
            {isCopied ? 'copied' : 'copy'}
          </button>
          <button className="custom-game-btn" onClick={onClickLobby}>
            Enter Game Lobby
          </button>
        </div>
      )}
      {isCopyError && (
        <div className="copy-error-msg-container">
          <h2 className="clipboard-error-msg">Failed to copy to clipboard. Please try again.</h2>
        </div>
      )}
    </div>
  );
};

export default InvitePlayer;
