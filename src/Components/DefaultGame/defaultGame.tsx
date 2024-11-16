import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './defaultGame.css';

const DefaultGame = () => {
  const [defaultGame, setDefaultGame] = useState<boolean>(false);
  const { gameId } = useParams();
  const dummyGameGenerate = async () => {
    const url = `http://localhost:8080/game/${gameId}/gamecreating`;
    const responce = await fetch(url);
    const data = await responce.json();
  };
  const serverUrl = import.meta.env.VITE_BASE_REST_API_URL;
  const navigate = useNavigate();
  const onClickDefaultGameButton = () => {
    dummyGameGenerate();
    setDefaultGame(true);
  };
  // const endTheGame = () => {

  // }
  const endTheGame = async () => {
    const url = `${serverUrl}/scores/${gameId}`;
    const res = await fetch(url);
    navigate(`/game/score/${gameId}`);
    console.log(res.ok);
  };
  return (
    <div className="dummy-game-container">
      <button className="dummy-game-button" onClick={onClickDefaultGameButton}>
        Assigning Role and Project To Player
      </button>
      {defaultGame && (
        <button className="dummy-game-button" onClick={endTheGame}>
          End Game
        </button>
      )}
    </div>
  );
};
export default DefaultGame;
