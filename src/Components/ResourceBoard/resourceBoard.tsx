import Month from '../Month/month';
import Request from '../Request/request';
import ResourceCard from '../ResourceCard/resourceCard';
import './resourceBoard.css';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../Header/header';

import { ResourceBoardType, ResourceCardType } from '../../types/types';
import Loader from '../Loader/loader';

const defaultBoard: ResourceBoardType = {
  id: '',
  title: '',
  owner: { id: '', name: '', role: 'RM', scores: [] },
  resources: [],
  skills: [],
};

interface JoinGameProps {
  isWebSocketConnected: boolean;
}

const ResourceBoard: React.FC<JoinGameProps> = ({ isWebSocketConnected }) => {
  const [resourceboard, setResourceBoard] = useState<ResourceBoardType>(defaultBoard);

  const [isLoading, setLoading] = useState<boolean>(true);
  // const [ass, setAss] = useState<string>('');
  const [searchParams] = useSearchParams();

  const paramValue = searchParams.get('playerId');

  const { gameId } = useParams();
  const createResourceBoard = () => {
    
  }
  const getResourceBoard = async (): Promise<void> => {
    const response = await fetch(`http://localhost:8080/games/${gameId}/resourceBoards/${paramValue}`);
    const jsonData: ResourceBoardType = await response.json();
    console.log(jsonData)
    setResourceBoard(jsonData);
    setLoading(false);
  };

  const getAppropriateResourceCards = (skillValue: string, resourceCards: ResourceCardType[]): ResourceCardType[] => {
    let requiredResourceCards: ResourceCardType[] = [];
    for (const each of resourceCards) {
      if (each.skill === skillValue) {
        requiredResourceCards = [...requiredResourceCards, each];
      }
    }
    return requiredResourceCards;
  };

  useEffect(() => {
    getResourceBoard();
  }, []);

  return (
    <div className="bg-container">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="content-container">
          <div className="title-card" style={{ backgroundColor: '#ffffff' }}>
            <Header heading={resourceboard.title} />
            <Month />
            <Request
              skillValue={resourceboard.skills[0]}
              resourceBoard={resourceboard}
              isWebSocketConnected={isWebSocketConnected}
              getResourceBoard={getResourceBoard}
              getAppropriateResourceCards={getAppropriateResourceCards}
            />
            <ResourceCard skillValue={resourceboard.skills[0]} resources={getAppropriateResourceCards(resourceboard.skills[0], resourceboard.resources)} />
            <Request
              skillValue={resourceboard.skills[1]}
              resourceBoard={resourceboard}
              isWebSocketConnected={isWebSocketConnected}
              getResourceBoard={getResourceBoard}
              getAppropriateResourceCards={getAppropriateResourceCards}
            />
            <ResourceCard skillValue={resourceboard.skills[1]} resources={getAppropriateResourceCards(resourceboard.skills[1], resourceboard.resources)} />
          </div>

          <div className="logo">
            <img src="https://res.cloudinary.com/dwc2npg5b/image/upload/v1728294665/imagesss-removebg-preview_lz96c6.png" alt="logo" className="logo" />
          </div>
        </div>
      )}
    </div>
  );
};
export default ResourceBoard;
