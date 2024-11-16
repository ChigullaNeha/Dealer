import './dealer.css';
import StompService from '../../StompService/stompService';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDrag, useDrop } from 'react-dnd';
import Popup from 'reactjs-popup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'reactjs-popup/dist/index.css';

interface JoinGameProps {
  isWebSocketConnected: boolean;
}
interface Player {
    id: string;
    name: string;
    type: string;
    typeOfList: string;
    role: string;
    owner: [];
}
interface Project {
    id: string,
    name: string
}
interface DragItem {
  id: string; 
  type: 'first' | 'second' | 'third' | 'rmOne' | 'rmTwo' | 'PLAYER'| 'PORJECT';
}
interface Resource {
  id: string;
  name: string;
  role: string;
  scores: [];
  type:string;
  owner: [];
  Player: [];
  typeOfList: string;
}
interface ProjectPlan {
  id: string;
    name: string;
    type: string;
    typeOfList: string;
    role: string;
    owner: [];
    project: [];
}
type ShakeState = { [key: string]: boolean };

const ProjectItem = ({ project }: { project: Project }) => {
    const [, dragPro] = useDrag(() => ({
      type: 'PROJECT',
      item: { id: project.id, type: 'PROJECT' },
    }), [project.id]);
  
    return (
      <h4 ref={dragPro}  style={{fontFamily: 'sans-serif'}} className='each-project' key={project.id}>
        {project.name}
      </h4>
    );
  };
  const PlayerItem = ({ player }: { player: Player, typeOfList: string }) => {
    const [, drag] = useDrag(() => ({
      type: 'PLAYER',
      item: { id: player.id, type: 'PLAYER' },
    }), [player.id]);
  
    return (
      <h4 ref={drag}  style={{fontFamily: 'sans-serif'}} className='each-player' key={player.id}>
        {player.name}
      </h4>
    );
  };
  const PlayerItems = ({ player, typeOfList }: { player: Player, typeOfList: string }) => {
    const [, drag] = useDrag(() => ({
      type: 'PLAYER',
      item: { id: player.id, type: 'PLAYER', typeOfList },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }), [player.id]);
  
    return (
      <h4 ref={drag}  style={{fontFamily: 'sans-serif'}} className='drop-player' key={player.id}>
        {player.name}
      </h4>
    );
  };
const DealerPage: React.FC<JoinGameProps> = ({ isWebSocketConnected }) => {
  const { gameId } = useParams<{ gameId: string }>(); 
  const [searchParams] = useSearchParams();
  const playerId: string | null = searchParams.get('playerId');
  const stompService = StompService.getInstance(); 
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player []>([]);
  const [projects, setProjects] = useState<Project []>([]);
  const [count, setCount] = useState(0);
  const [dealer, setDealer] = useState<Player []>([]);
  const [resources, setResources] = useState<Resource []>([]);
  const [projectPlans, setProjectPlans] = useState<ProjectPlan []>([]);
  const [projectManagerOne, setProjectManagerOne] = useState<ProjectPlan []>([]);
  const [projectManagerTwo, setProjectManagerTwo] = useState<ProjectPlan []>([]);
  const [projectManagerThree, setProjectManagerThree] = useState<ProjectPlan []>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [fetchedPlayers, setFetchedPlayers] = useState([]);
  const [isStartGameButtonClicked, setStartBtnClicked] = useState();
  const [shake, setShake] = useState<ShakeState>({});

  const setPlayerss = () => {
    if (isWebSocketConnected) {
        stompService.sendMessage(`/game/players/${gameId}`, '');
        stompService.sendMessage(`/game/projects/set-projects/${gameId}`, '');
        localStorage.removeItem("startGameButtonClicked");
    }
};

useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisitedDealerPage");
    if (!hasVisited && isWebSocketConnected) {
        setPlayerss();
        sessionStorage.setItem("hasVisitedDealerPage", "true");
    }
}, [isWebSocketConnected]); 

  
  
  const playersList = async () => {
    const options = {
      method: 'GET',
    };
    try {
      const response = await fetch(`http://localhost:8080/game/${encodeURIComponent(gameId)}/players`, options);
      const data = await response.json();
       setFetchedPlayers(data);
      const currentPlayer = data.find((player: Player) => player.id === playerId); 
     
      if (currentPlayer && currentPlayer.role === 'DEALER') {
        navigate(`/game/dealer/${gameId}?playerId=${playerId}`);
      } else {
        navigate(`/game/players/${gameId}?playerId=${playerId}`); 
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };
  useEffect(() => {
    if (isWebSocketConnected) {
        stompService.subscribe(`/topics/players/copy/${gameId}`, (message) => {
            const playersData = JSON.parse(message.body);
            setDealer(playersData[0]);
            setPlayers(playersData.slice(1));
        });
        stompService.sendMessage(`/game/players/copy/${gameId}`, '', {});
        // get projects
        stompService.subscribe(`/topics/projects/${gameId}`, (message) => {
            const projectsData = JSON.parse(message.body);
            setProjects(projectsData);
        })
        stompService.sendMessage(`/game/projects/${gameId}`, '');
       // get resources from game
        stompService.subscribe(`/topics/resources/${gameId}`, (message) => {
          const resourcesData = JSON.parse(message.body);
          setResources(resourcesData);
          console.log(resourcesData, "resources");
        });
        stompService.sendMessage(`/game/resources/${gameId}`, '', {});  
        
        // get pps
        stompService.subscribe(`/topics/projectPlansList/${gameId}`, (message) => {
          const pps = JSON.parse(message.body);
          setProjectPlans(pps);
          if(pps) {
            setProjectManagerOne(pps.slice(0,2));
            setProjectManagerTwo(pps.slice(2,4));
            setProjectManagerThree(pps.slice(4,6));
          }
          console.log(pps, "projectPlanssss");
        })
        stompService.sendMessage(`/game/projectPlansList/${gameId}`,'')
        
        stompService.subscribe(`/topics/start-game/${gameId}`, (message) => {
          navigate(`/game/gamePlay/${gameId}?playerId=${playerId}`);
          console.log(message.body, "GameStarted")
        })
        const data = localStorage.getItem("startGameButtonClicked") === "true";
        setStartBtnClicked(data);
      } 
      stompService.subscribe(`/topics/end-game/${gameId}`, (message) => {
        navigate(`/game/score/${gameId}`)
        console.log(message.body, "EndGame")
      })
      
      playersList();
}, [stompService, gameId, count, isWebSocketConnected]);
console.log(isWebSocketConnected, "webSocket");
const triggerShake = (key: string) => {
  setShake((prev) => ({ ...prev, [key]: true }));
  setTimeout(() => {
    setShake((prev) => ({ ...prev, [key]: false }));
  }, 500);
};
const showToastMessage = () => {
  toast.error("Player already set", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
  });
};
const showToastForProject = () => {
  toast.error("Projects already set", {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
});
}
console.log(playerId, 'Player_ID');
console.log(dealer, "Dealer")
const firstResourceManager = resources[0]?.owner as unknown as Resource;
const secondResourceManager = resources[1]?.owner as unknown as Resource;
const setResourceManagerOwner = (index: number, player: Player) => {
  if(isWebSocketConnected) {
    stompService.sendMessage(
      `/game/set-owner/resources/${index}/${gameId}`, 
      JSON.stringify(player)
    );
    
  }
  setCount(count + 1);
  
};
// if(isWebSocketConnected) {
//   stompService.subscribe(`/topics/resources/${gameId}`, (message) => {
//     const updatedData = JSON.parse(message.body);
//     setResources(updatedData);
//   });
// }

const setProjectManagerOwner = async (firstIndex: number, secondIndex: number, player: Player) => {
  const data = {
    "firstIndex": firstIndex,
    "secondIndex": secondIndex,
    "player": player,
  };
  stompService.sendMessage(`/game/addPlayerToPMList/${gameId}`, JSON.stringify(data));  
};
// if(isWebSocketConnected) {
//   stompService.subscribe(`/topics/projectPlansList/${gameId}`, (message) => {
//     const updatedProjectPlans = JSON.parse(message.body);
//     setProjectPlans(updatedProjectPlans); 
//   });
// }

const removePlayerFromPlayersList = (id: string) => {
  if(isWebSocketConnected) {
    stompService.sendMessage(`/game/players/remove/${gameId}`, id);
  }
  
  setCount(count + 1);
}
const resetPlayers = () => {
  if(isWebSocketConnected) {
    stompService.sendMessage(`/game/reset-players/${gameId}`, '')
    stompService.sendMessage(`/game/reset-boards/${gameId}`, '')
    stompService.sendMessage(`/game/reset/pms/${gameId}`, '')
    stompService.sendMessage('/game/reset-projects', '')
  }
 
  setCount(count + 1);
}
const removeProjectFromProjectsList = (id: string) => {
  if(isWebSocketConnected) {
    stompService.sendMessage(`/game/remove-project`, id);
  }
  setCount(count + 1);
}
const addPlayerToPlayersList = (player: Player) => {
  if(isWebSocketConnected) {
    stompService.sendMessage(`/game/add-player/${gameId}`, JSON.stringify(player));
  }
  
  setCount(count + 1);
}
const removePlayerFromPmList = (firstIndex: number, secondIndex: number) => {
  const data = {
    "firstIndex":firstIndex,
    "secondIndex":secondIndex,
  };
  if(isWebSocketConnected) {
    stompService.sendMessage(`/game/PMList/removePlayer/${gameId}`, JSON.stringify(data))
  }
  
  setCount(count + 1);
}
const removeProjectFromPmList = (index:number) => {
  const data = {
    "index":index,
  };
  if(isWebSocketConnected) {
    stompService.sendMessage(`/game/PMList/removeProject/${gameId}`, JSON.stringify(data))
  }
  setCount(count + 1);
}
const setProjectToProjectManager = (index: number, project: Project) => {
  const payload = {
    "index": index,
    "project": project
};
if(isWebSocketConnected) {
  stompService.sendMessage(`/game/setProject/${gameId}`, JSON.stringify(payload));
} 
  setCount(count + 1);
}
// if(isWebSocketConnected) {
//   stompService.subscribe(`/topics/projectPlansList/${gameId}`, (message) => {
//     const updatedProjectPlans = JSON.parse(message.body);
//     setProjectPlans(updatedProjectPlans); 
//   });
// }

const addProjectToProjectsList = (project: Project) => {
  if(isWebSocketConnected) {
    stompService.sendMessage('/game/add-project', JSON.stringify(project));
  }
  
  setCount(count + 1);
}
const removoeRmOwner = (index: number) => {
  const data = {
    "index": index
  }
  if(isWebSocketConnected) { 
    stompService.sendMessage(`/game/remove-owner/${gameId}`, JSON.stringify(data));
  }
  
  setCount(count + 1);
}


const addPlayerToProjectOrResourceManager = (type: string, id: string) => {
  const newPlayer = players.find((each) => each.id === id);
  switch (type) {
    case 'first':
      if (newPlayer && projectManagerOne[0]?.owner == null) {
        setProjectManagerOwner(0, 1, newPlayer);
         removePlayerFromPlayersList(id);
      } else {
        triggerShake('first');
        showToastMessage();
      }
      break;
    case 'second':
      if (newPlayer && projectManagerTwo[0]?.owner == null) {
        setProjectManagerOwner(2, 3, newPlayer);
         removePlayerFromPlayersList(id);
      }  else {
        triggerShake('second');
        showToastMessage();
      }
      break;
    case 'third':
      if (newPlayer && projectManagerThree[0]?.owner == null) {
        setProjectManagerOwner(4, 5, newPlayer);
         removePlayerFromPlayersList(id);
      } else {
        triggerShake('third');
        showToastMessage();
      }
      break;
    case 'rmOne':
      if (newPlayer && resources[0]?.owner == null) {
        setResourceManagerOwner(0, newPlayer);
         removePlayerFromPlayersList(id);
      } else {
        triggerShake('rmone');
        showToastMessage();
      }
      break;
    case 'rmTwo':
      if (newPlayer && resources[1]?.owner == null) {
        setResourceManagerOwner(1, newPlayer);
         removePlayerFromPlayersList(id);
      } else {
        triggerShake('rmtwo');
        showToastMessage();
      }
      break;
    default:
      console.warn(`Unknown drop area: ${type}`);
    setCount(count + 1);
  }
  // const messageDetails = {
  //     gameId,
  //     player: newPlayer,
  //     dealerName: dealer,
  //   }
    
  //   if(isWebSocketConnected) {
  //     stompService.sendMessage(`/app/dealerAction/${gameId}`, JSON.stringify(messageDetails), '')
  //   }
   
  
};
const addProjectToProjectManager = (type: string, id: string) => {
  const projectManagers = [projectManagerOne, projectManagerTwo, projectManagerThree];
  const typeIndex = ["first", "second", "third"].indexOf(type);
  if (typeIndex === -1) {
    console.warn(`Unknown drop area: ${type}`);
    return;
  }
  const newProject = projects.find((each) => each.id === id);
  if (!newProject) return;

  const selectedManager = projectManagers[typeIndex];
  
  let projectAssigned = false;
  selectedManager.forEach((slot, index) => {
    if (!projectAssigned && slot.project == null && slot.owner) {
      setProjectToProjectManager(typeIndex * 2 + index, newProject);
      removeProjectFromProjectsList(id);
      setCount(count + 1);
      projectAssigned = true;
    }
  });

  if (!projectAssigned) {
    triggerShake(type);
    showToastForProject();
  }
};

const [, dropPM1] = useDrop({
  accept: ['PLAYER', 'PROJECT'],
  drop: (item: DragItem) => {
    if(item.type === 'PLAYER') {
      addPlayerToProjectOrResourceManager("first", item.id);
      setCount(count + 1);
    } else {
      addProjectToProjectManager("first", item.id);
      setCount(count + 1);
    }
  },
});

const [, dropPM2] = useDrop({
  accept: ['PLAYER', 'PROJECT'],
  drop: (item: DragItem) => {
    if(item.type === 'PLAYER') {
      addPlayerToProjectOrResourceManager("second", item.id);
      setCount(count + 1);
    } else {
      addProjectToProjectManager("second", item.id);
      setCount(count + 1);
    }
  },
});

const [, dropPM3] = useDrop({
  accept: ['PLAYER', 'PROJECT'],
  drop: (item: DragItem) => {
    if(item.type === 'PLAYER') {
      addPlayerToProjectOrResourceManager("third", item.id);
      setCount(count + 1);
    } else {
      addProjectToProjectManager("third", item.id);
      setCount(count + 1);
    }
  },
});
const [, dropRM1] = useDrop({
  accept: 'PLAYER',
  drop:  (item: DragItem) => {
    if (item.type === 'PLAYER') {
       addPlayerToProjectOrResourceManager("rmOne", item.id);
       setCount(count + 1);
    }
  }
});
const [, dropRM2] = useDrop({
  accept: 'PLAYER',
  drop: (item: DragItem) => {
    if(item.type === 'PLAYER') {
      addPlayerToProjectOrResourceManager("rmTwo", item.id);
      setCount(count + 1);
    }
  }
})
const [, dropP] = useDrop({
  accept: 'PLAYER',
  drop: (item: Player) => {
    let player;
    switch (item.typeOfList) {
      case 'first':
        if (projectManagerOne[0]?.owner !== null) {
          if (projectManagerOne.length > 0 && projectManagerOne[0]?.owner) {
            const owner = projectManagerOne[0].owner;
            addPlayerToPlayersList(owner);
        }
          removePlayerFromPmList(0,1);
          setCount(count + 1);
          if(projectManagerOne[0]?.project !== null) {
            addProjectToProjectsList(projectManagerOne[0]?.project);
            setCount(count + 1);
          }  if(projectManagerOne[1]?.project !== null) {
            addProjectToProjectsList(projectManagerOne[1]?.project);
            setCount(count + 1);
          }
      }
        break;
      case 'second':
        if (projectManagerTwo[0].owner !== null) {
          if (projectManagerTwo.length > 0 && projectManagerTwo[0]?.owner) {
            const owner = projectManagerTwo[0].owner;
            addPlayerToPlayersList(owner);
        }
          removePlayerFromPmList(2,3);
          setCount(count + 1);
          if(projectManagerTwo[0]?.project !== null) {
            addProjectToProjectsList(projectManagerTwo[0]?.project);
            setCount(count + 1);
          }  if(projectManagerTwo[1]?.project !== null) {
            addProjectToProjectsList(projectManagerTwo[1]?.project);
            setCount(count + 1);
          }
        }
        break;
        case 'third':
          if (projectManagerThree[0].owner !== null) {
            if (projectManagerThree.length > 0 && projectManagerThree[0]?.owner) {
              const owner = projectManagerThree[0].owner;
              addPlayerToPlayersList(owner);
              
          }
            removePlayerFromPmList(4,5);
            setCount(count + 1);
            if(projectManagerThree[0]?.project !== null) {
              addProjectToProjectsList(projectManagerThree[0]?.project);
              setCount(count + 1);
            }  if(projectManagerThree[1]?.project !== null) {
              addProjectToProjectsList(projectManagerThree[1]?.project);
              setCount(count + 1);
            }
        } 
          break;
      case 'rmOne':
        if(firstResourceManager.owner !== null) {
          removoeRmOwner(0);
          addPlayerToPlayersList(firstResourceManager);
          setCount(count + 1);
        }
          break;
      case 'rmTwo':
        if(secondResourceManager.owner !== null) {
          removoeRmOwner(1);
            addPlayerToPlayersList(secondResourceManager);
            setCount(count + 1);
        }
          break;
      default:
        console.warn(`Unknown typeOfList: ${item.typeOfList}`);
    }
    setCount(count + 1);
  },
});
const [, dropPro] = useDrop({
  accept: ['PLAYER', 'PROJECT'],
  drop: (item) => {
    let entity;
    switch (item.typeOfList) {
      case 'first': {
        const entityOne = projectManagerOne[0]?.project; 
        const entityTwo = projectManagerOne[1]?.project; 
        if (entityOne && entityOne.id === item.id) {
          removeProjectFromPmList(0);
          addProjectToProjectsList(entityOne);
          setCount(count + 1);
        } else if (entityTwo && entityTwo.id === item.id) {
          removeProjectFromPmList(1);
          addProjectToProjectsList(entityTwo);
          setCount(count + 1);
        }
    }
    break;
    case 'second': {
      const entityOne = projectManagerTwo[0]?.project; 
      const entityTwo = projectManagerTwo[1]?.project; 
      if (entityOne && entityOne.id === item.id) {
        removeProjectFromPmList(2);
        addProjectToProjectsList(entityOne);
        setCount(count + 1);
      } else if (entityTwo && entityTwo.id === item.id) {
        addProjectToProjectsList(entityTwo);
          removeProjectFromPmList(3);
          setCount(count + 1);
      }
    } 
    break;

    case 'third': {
      const entityOne = projectManagerThree[0]?.project; 
      const entityTwo = projectManagerThree[1]?.project; 
      if (entityOne && entityOne.id === item.id) {
        addProjectToProjectsList(entityOne);
          removeProjectFromPmList(4);
          setCount(count + 1);
      } else if (entityTwo && entityTwo.id === item.id) {
        addProjectToProjectsList(entityTwo);
          removeProjectFromPmList(5);
          setCount(count + 1);
      }
    } 
    break;
      default:
        console.warn(`Unknown typeOfList: ${item.typeOfList}`);
    }
    setCount(count + 1);
  },
});
console.log(gameId, "Game_id")
const areAllRolesAssigned = () => {
  return (
    projectManagerOne[0]?.owner !== null && projectManagerOne[0]?.project!== null && projectManagerOne[1]?.project!== null  &&
    projectManagerTwo[0]?.owner !== null && projectManagerTwo[0]?.project!== null && projectManagerTwo[1]?.project!== null  &&
    projectManagerThree[0]?.owner !== null && projectManagerThree[1]?.project !== null && projectManagerThree[1]?.project!== null  &&
    firstResourceManager !== null &&
    secondResourceManager !== null
  );
};
 // Function to handle starting the game
 const handleStartGame = async() => {
  const createResourceUrl = await fetch(`http://localhost:8080/createResourceBoard/${gameId}`);
  const resourcesData = await createResourceUrl.json();
  console.log(resourcesData, "REsourcesDAta")
  
  if (!areAllRolesAssigned()) {
    setShowPopup(true);
  } else {
    console.log('Game started!');
    setStartBtnClicked(true);
     localStorage.setItem("startGameButtonClicked", true);
     
      stompService.sendMessage(`/game/start-game/${gameId}`, '')
     
    
    // navigate(`/game/dealer/${gameId}?playerId=${playerId}`)
  }
  setCount(count + 1);
};
const serverUrl = import.meta.env.VITE_BASE_REST_API_URL;
const handleEndGame = async() => {
  localStorage.removeItem("startGameButtonClicked");
  const url = `${serverUrl}/scores/${gameId}`;
    const res = await fetch(url);
     navigate(`/game/score/${gameId}`);
     stompService.sendMessage(`/game/end-game/${gameId}`, '')
     setCount(count + 1); 
}

  return (
    <div>
      <div className='whole-containerr'>
        <div className='dealer-container'>
          <h4>Welcome, {dealer.name}</h4>
        </div>
        <div className='containerr'>
          <div className='playerss-containerr' ref={dropP}>
            <h4 style={{position: 'absolute', top: 0, textAlign: 'center', fontSize: '20px',marginTop: '4px'}}>Players</h4>
              {players?.map(each => (
                  <PlayerItem key={each.id} player={each} typeOfList="" />
              ))}
          </div>
          <div className='ul-containerr'>
            <div className='cards-containerr'>
              <div ref={dropPM1} className={`pm-container ${shake['first'] ? 'shake' : ''}`}>
                <h4 className='pm-heading'>Project Manager One</h4>
                {projectManagerOne[0]?.owner && (
                  <div>
                    <PlayerItems player={projectManagerOne[0]?.owner} key={projectManagerOne[0].owner.id} typeOfList='first' />
                  </div>
                 )}
                {projectManagerOne[0]?.project && (
                  <div>
                    <PlayerItems player={projectManagerOne[0]?.project} key={projectManagerOne[0].project.id} typeOfList="first" />
                  </div>
                )}
                {projectManagerOne[1]?.project && (
                  <div>
                    <PlayerItems player={projectManagerOne[1]?.project} key={projectManagerOne[1].project.id} typeOfList="first" />
                  </div>
                )}
              </div>
              <div ref={dropPM2} className={`pm-container ${shake['second'] ? 'shake' : ''}`}>
                <h4 className='pm-heading'>Project Manager Two</h4>
                {projectManagerTwo[0]?.owner && (
                  <div>
                    <PlayerItems player={projectManagerTwo[0].owner} key={projectManagerTwo[0].owner.id} typeOfList='second' />
                  </div>
                 )}
                {projectManagerTwo[0]?.project && (
                  <div>
                    <PlayerItems player={projectManagerTwo[0].project} key={projectManagerTwo[0].project.id} typeOfList="second" />
                  </div>
                )}
                {projectManagerTwo[1]?.project && (
                  <div>
                    <PlayerItems player={projectManagerTwo[1].project} key={projectManagerTwo[1].project.id} typeOfList="second" />
                  </div>
                )}
              </div>
              <div ref={dropPM3} className={`pm-container ${shake['third'] ? 'shake' : ''}`}>
                <h4 className='pm-heading'>Project Manager Three</h4>
                {projectManagerThree[0]?.owner && (
                  <div>
                    <PlayerItems player={projectManagerThree[0].owner} key={projectManagerThree[0].owner.id} typeOfList='third' />
                  </div>
                 )}
                {projectManagerThree[0]?.project && (
                  <div>
                    <PlayerItems player={projectManagerThree[0].project} key={projectManagerThree[0].project.id} typeOfList="third" />
                  </div>
                )}
                {projectManagerThree[1]?.project && (
                  <div>
                    <PlayerItems player={projectManagerThree[1].project} key={projectManagerThree[1].project.id} typeOfList="third" />
                  </div>
                )}
              </div>
              <div ref={dropRM1} className={`pm-container ${shake['rmone'] ? 'shake' : ''}`}>
                <h4 className='pm-heading'>Resource Manager One</h4>
                {firstResourceManager && (
                  <PlayerItems player={firstResourceManager} key={firstResourceManager.id} typeOfList="rmOne" />
                )}
              </div>
              <div ref={dropRM2} className={`pm-container ${shake['rmtwo'] ? 'shake' : ''}`}>
                <h4 className='pm-heading'>Resource Manager Two</h4>
                {secondResourceManager && (
                  <PlayerItems player={secondResourceManager} key={secondResourceManager.id} typeOfList="rmTwo" />
                )}
              </div>
           </div>
            <div className='btns-containerr'>
              <Popup open={showPopup} onClose={() => setShowPopup(false)} className='popup' >
                <div>
                  <p>Starting the game is not allowed without all roles and projects being assigned!</p>
                  <button onClick={() => setShowPopup(false)} className='close-btn'>Close</button>
                </div>
              </Popup>
            {(isStartGameButtonClicked) ? (
          <button type='button' className='btnn'  onClick={handleEndGame}>End Game</button>
            ) : (
          <>
            <button type='button' className='btnn' onClick={handleStartGame}>Start Game</button>
            <button type='button' className='btnn' onClick={() => resetPlayers()}>Reset</button>
          </>
          )}
      </div>
           </div>
        <div ref={dropPro}  className='projectss-containerr'>
          <h4 style={{position: 'absolute', top: 0, textAlign: 'center', fontSize: '20px',marginTop: '4px'}}>Projects</h4>
          {projects.map(each => (
            <ProjectItem key={each.id} project={each} />
          ))}
        </div>
        </div>
      </div>
      <ToastContainer position="top-left"
    autoClose={1000}
    hideProgressBar={false}
    newestOnTop={true}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
     />
    </div>
    
   
  );
};

export default DealerPage;
