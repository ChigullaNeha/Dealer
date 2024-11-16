import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import StompService from '../../StompService/stompService';
import { Owner, ProjectPlan, Request } from '../../types/types';
import Loader from '../Loader/loader';
import Project from '../Project/project';
import './projectManager.css';
interface JoinGameProps {
  isWebSocketConnected: boolean;
}

const ProjectManager: React.FC<JoinGameProps> = ({ isWebSocketConnected }) => {
  const [allProjects, setAllProject] = useState<ProjectPlan[]>([]); // Stores projects of a player
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [player, setPlayer] = useState<Owner>(); // Stores player data
  const [requests, setRequests] = useState<Request[]>([]);
  const [requestFullfilled, setRequestFullfilled] = useState('');
  const [porjectChanged, setProjectChanged] = useState<String>('');
  // Triggers whenever project timeline has changed
  const [isLoading, setLoading] = useState<boolean>(true);

  //To get owner id from url
  const [searchParams] = useSearchParams();
  const playerId: string | null = searchParams.get('playerId');

  // stomp instance
  const stompService = StompService.getInstance();

  const { gameId } = useParams();

  // getting projects based on the playerId and assigning to the AllProject
  const getTheProjectDataByPlayerId = async (gameId: string, playerId: string) => {
    const url = `http://localhost:8080/games/${gameId}/projectPlans?ownerId=${playerId}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      setAllProject(data);
    } else {
      const message = await response.text();
      setErrMsg(message);
    }
  };
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

  // Establish websocket connection
  const establishWebSocket = () => {
    stompService.subscribe('/topics/moveProject', (message) => {
      setProjectChanged(message.body);
    });
  };

  //Fetch user Details
  useEffect(() => {
    getThePlayerByPlayerId(gameId ?? '1', playerId ?? '1');
    if (isWebSocketConnected) {
      establishWebSocket();
    }
  }, [isWebSocketConnected]);

  const getAllRequestCards = async (gameId: string) => {
    const url = `http://localhost:8080/game/${gameId}/allrequests`;
    const options = {
      method: 'GET',
    };
    const response = await fetch(url, options);
    const data = await response.json();

    setRequests(data);
    setLoading(false);
  };

  // to fetch the data initially when app started
  useEffect(() => {
    getTheProjectDataByPlayerId(gameId ?? '1', playerId ?? '1');
    getAllRequestCards(gameId ?? '1');
  }, [porjectChanged, requestFullfilled]);

  const onRequestFullfilled = (data: string) => {
    setRequestFullfilled(data);
  };
  
  return (
    <div className="background-image">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* if error message is null then the data will be passed to Project Component */}
          {errMsg === null ? (
            <>
              {allProjects.length > 0 ? (
                <div className="main-container">
                  {player !== undefined && player.role === 'PM' && (
                    <div className="project-display-main-container">
                      {allProjects.map((each: ProjectPlan) => {
                        const matchingRequest = requests.find((req) => req.projectPlanId === each.id && req.status === 'OPEN');
                        return (
                          <Project key={each.id} eachProject={each} setErrMsg={setErrMsg} onRequestFullfilled={onRequestFullfilled} request={matchingRequest} />
                        );
                      })}
                    </div>
                  )}

                  <>
                    {player !== undefined && (
                      <h3 className="playerName">
                        {player.name}-{player.role}
                      </h3>
                    )}
                  </>
                </div>
              ) : (
                // If no project is assigned to the player this message will show
                <div className="not-found-btn-container">
                  <button className="not-found-btn">Project Not Assigned</button>
                </div>
              )}
            </>
          ) : (
            // if any error accured this error message will show
            <div className="not-found-btn-container">
              <button className="not-found-btn">{errMsg}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectManager;