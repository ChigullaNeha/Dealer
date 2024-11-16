import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Owner } from '../../types/types';
import ProjectManager from '../ProjectManager/projectManager';
// import ProjectManager from '../ProjectManager/projectManager';
import ResourceBoard from '../ResourceBoard/resourceBoard';

interface JoinGameProps {
  isWebSocketConnected: boolean;
}

const BoardAssignment: React.FC<JoinGameProps> = ({ isWebSocketConnected }) => {
  const [player, setPlayer] = useState<Owner>(); // Stores player data
  const [errMsg, setErrMsg] = useState<string | null>(null);

  //To get owner id from url
  const [searchParams] = useSearchParams();
  const playerId: string | null = searchParams.get('playerId');

  const { gameId } = useParams();

  // to get the player details based on the playerId
  const getThePlayerByPlayerId = async (gameId: string, playerId: string) => {
    const url = `http://localhost:8080/games/${gameId}/players/${playerId}`;
    const option = {
      method: 'GET',
    };
    const response = await fetch(url, option);
    if (response.ok) {
      const data = await response.json();
      setPlayer(data);
      // store player name for feture use
      localStorage.setItem('playerName', data.name);
    } else {
      setErrMsg(await response.text());
    }
  };
  useEffect(() => {
    getThePlayerByPlayerId(gameId ?? '1', playerId ?? '1');
  }, []);
  const renderView = () => {
    if (player !== undefined && player.role === 'RM') {
      return <ResourceBoard isWebSocketConnected={isWebSocketConnected} />;
    }
    return <ProjectManager isWebSocketConnected={isWebSocketConnected} />;
  };
  return <>{renderView()}</>;
};

export default BoardAssignment;
