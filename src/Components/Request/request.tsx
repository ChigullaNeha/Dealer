import { useEffect, useState } from 'react';

import Loader from '../Loader/loader';

import IndividualRequest from '../IndividualRequest/individualRequest';

import { Client } from '@stomp/stompjs';

import { useParams } from 'react-router-dom';

// import stomp client bharath
import StompService from '../../StompService/stompService';

import { PlayerType, RequestType, ResourceBoardType, ResourceCardType } from '../../types/types';

import './request.css';

interface propsType {
  skillValue: string;
  resourceBoard: ResourceBoardType;
  isWebSocketConnected: boolean;
  getResourceBoard: () => Promise<void>;
  getAppropriateResourceCards: (skillValue: string, resourceCards: ResourceCardType[]) => ResourceCardType[];
}
const Request: React.FC<propsType> = (props): JSX.Element => {
  const { skillValue, getResourceBoard, resourceBoard, getAppropriateResourceCards, isWebSocketConnected } = props;

  const [projectManagers, setProjectManagers] = useState<PlayerType[]>([]);

  const [stompClient, setStompClient] = useState<Client | null>(null);

  const [requests, setRequests] = useState<RequestType[]>([]);

  const { gameId } = useParams();

  const [isLoading, setLoading] = useState<boolean>(true);

  const getProjectManagers = async () => {
    const response = await fetch(`http://localhost:8080/games/${gameId}/projectBoardOwners`);
    const jsonData = await response.json();

    setProjectManagers(jsonData);
  };

  const isResourceCardExist = (time: number) => {
    const resources = getAppropriateResourceCards(skillValue, resourceBoard.resources);
    for (const resource of resources) {
      if (resource.time === time) {
        return true;
      }
    }
    return false;
  };

  // bharath

  const stompService = StompService.getInstance();
  const makingApi = () => {
    stompService.subscribe('/topics/fulFilledRequest/*', () => {
      getRequests();
      getResourceBoard();
    });
    stompService.subscribe(`/topics/moveProject`, () => {
      getResourceBoard();
      getRequests();
    });

    stompService.subscribe(`/topics/request`, () => {
      getRequests();
    });

    stompService.subscribe('/topics/revoked', () => {
      getRequests();
    });
  };

  useEffect(() => {
    getProjectManagers();
    getRequests();
    setLoading(false);
    if (isWebSocketConnected) {
      makingApi();
    }
  }, [isWebSocketConnected]);

  const getRequests = async () => {
    const response = await fetch(`http://localhost:8080/games/${gameId}/requests`);
    const jsonData = await response.json();

    setRequests(jsonData);
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <table className="table-con">
          <tbody>
            {projectManagers.map((each) => {
              let currentRequest: RequestType | null = null;

              for (const request of requests) {
                if (request.demand.skill === skillValue && request.playerId === each.id) {
                  currentRequest = request;
                }
              }
              return (
                <IndividualRequest
                  stompClient={stompClient}
                  resourceBoard={resourceBoard}
                  key={each.id}
                  playerName={each.name}
                  isWebSocketConnected={isWebSocketConnected}
                  displayRequest={currentRequest}
                  isResourceCardExist={isResourceCardExist}
                />
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Request;
