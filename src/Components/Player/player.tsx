import { useEffect, useState } from 'react';
import StompService from '../../StompService/stompService';
import { useParams } from 'react-router-dom';
import './player.css'

interface JoinGameProps {
    isWebSocketConnected: boolean;
  }
  interface Player {
    id: string,
    name: string
}
const Player: React.FC<JoinGameProps> = ({ isWebSocketConnected })=> {
    const stompService = StompService.getInstance(); 
    const { gameId } = useParams<{ gameId: string }>(); 
    const [players, setPlayers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectPlans, setProjectPlans] = useState([]);
    const [projectManagerOne, setProjectManagerOne] = useState([]);
  const [projectManagerTwo, setProjectManagerTwo] = useState([]);
  const [projectManagerThree, setProjectManagerThree] = useState([]);
  const [resources, setResources] = useState([]);
    useEffect(() => {
        if (isWebSocketConnected) {   
          stompService.subscribe(`/topics/resources/${gameId}`, (message) => {
            const resourcesData = JSON.parse(message.body);
            setResources(resourcesData);
            console.log(resourcesData, "resources");
          });
          stompService.sendMessage(`/game/resources/${gameId}`, '', {}); 
          stompService.subscribe(`/topics/players/copy/${gameId}`, (message) => {
            const playersData = JSON.parse(message.body);
            setPlayers(playersData.slice(1));
        });
        stompService.sendMessage(`/game/players/copy/${gameId}`, '', {});
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
            // get projects
        stompService.subscribe(`/topics/projects/${gameId}`, (message) => {
          const projectsData = JSON.parse(message.body);
          setProjects(projectsData);
      })
      stompService.sendMessage(`/game/projects/${gameId}`, '');
        }
    }, [isWebSocketConnected, gameId]);

  const firstResourceManager = resources[0]?.owner;
const secondResourceManager = resources[1]?.owner;
console.log(resources, 'resources');
console.log(firstResourceManager);
console.log(secondResourceManager);
  return (
    <div className='whole-player-container'>
      <div className='container'>
      <div className='playerss-container'>
        <h4 style={{position: 'absolute', top: 0, textAlign: 'center', fontSize: '20px',marginTop: '4px'}}>Players</h4>
        {players.map(each => (
            <h4 className='each-player'>{each.name}</h4>
        ))}
      </div>
      <div className='cards-container'>
        <div className='ul-container'>
        <div className='cards-container'>
              <div className='pm-container'>
                <h4 className='pm-heading'>Project Manager One</h4>
                {projectManagerOne[0]?.owner && (
                  <div>
                    <h4 className='drop-player'>{projectManagerOne[0]?.owner.name}</h4>
                  </div>
                 )}
                {projectManagerOne[0]?.project && (
                  <div>
                    <h4 className='drop-player'>{projectManagerOne[0]?.project.name}</h4>
                  </div>
                )}
                {projectManagerOne[1]?.project && (
                  <div>
                    <h4 className='drop-player'>{projectManagerOne[1]?.project.name}</h4>
                  </div>
                )}
              </div>
              <div className='pm-container'>
                <h4 className='pm-heading'>Project Manager Two</h4>
                {projectManagerTwo[0]?.owner && (
                  <div>
                    <h4 className='drop-player'>{projectManagerTwo[0]?.owner.name}</h4>
                  </div>
                 )}
                {projectManagerTwo[0]?.project && (
                  <div>
                    <h4 className='drop-player'>{projectManagerTwo[0]?.project.name}</h4>
                  </div>
                )}
                {projectManagerTwo[1]?.project && (
                  <div>
                    <h4 className='drop-player'>{projectManagerTwo[1]?.project.name}</h4>
                  </div>
                )}
              </div>
              <div className='pm-container'>
                <h4 className='pm-heading'>Project Manager Three</h4>
                {projectManagerThree[0]?.owner && (
                  <div>
                    <h4 className='drop-player'>{projectManagerThree[0]?.owner.name}</h4>
                  </div>
                 )}
                {projectManagerThree[0]?.project && (
                  <div>
                    <h4 className='drop-player'>{projectManagerThree[0]?.project.name}</h4>
                  </div>
                )}
                {projectManagerThree[1]?.project && (
                  <div>
                    <h4 className='drop-player'>{projectManagerThree[1]?.project.name}</h4>
                  </div>
                )}
              </div>
              <div  className='pm-container'>
                <h4>Resource Manager One</h4>
                {firstResourceManager && (
                  <h4 className='drop-player'>{firstResourceManager.name}</h4>
                )}
              </div>
              <div className='pm-container'>
                <h4>Resource Manager One</h4>
                {secondResourceManager && (
                  <h4 className='drop-player'>{secondResourceManager.name}</h4>
                )}
              </div>
           </div>
        </div>
      </div>
      <div className='projectss-container'>
          <h4 style={{position: 'absolute', top: 0, textAlign: 'center', fontSize: '20px', marginTop: '4px'}}>Projects</h4>
          {projects.map(each => (
            <h4 className='each-project'>{each.name}</h4>
          ))}
        </div>
        </div>
    </div>
  )
}
export default Player
