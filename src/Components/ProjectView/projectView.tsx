import { Dispatch, SetStateAction, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { useParams, useSearchParams } from 'react-router-dom';
import StompService from '../../StompService/stompService';
import { ProjectPlan } from '../../types/types';
import ProjectCard from '../ProjectCard/projectCard';
import './projectView.css';

// To display months
const months: number[] = [];
for (let i = 2; i <= 8; i++) {
  months.push(i);
}

// props type for each project and stomp client instance
type PropsType = {
  single: ProjectPlan;
  setProjectUpdatedTime: Dispatch<SetStateAction<number>>;
};

// To display dragable project view

const ProjectView = (props: PropsType) => {
  const { single, setProjectUpdatedTime } = props;
  const { project, projectStartTime, id } = single; // Destructure project plane of a specific user
  const [currentColumn, setCurrentColumn] = useState(projectStartTime + 2); // Initialize column to 2

  const cardSpan = single.project.initialFinishTime - single.project.initialStartTime + 1;
  const { gameId } = useParams();
  const stompService = StompService.getInstance();
  const nodeRef = useRef(null); // Ref for draggable card
  const [searchParams] = useSearchParams();
  const playerId: string | null = searchParams.get('playerId'); // Get playerId

  // Handle drag stop event
  const handleDragStop = (e: any, data: any) => {
    // Calculate the new column based on drag position

    const newColumn = Math.round(data.x / ((window.innerWidth * 0.7) / 7)) + 2; // Adjust calculation for 75% width
    // Ensure card stays within columns 2 to 8
    if (newColumn >= 2 && newColumn <= 8 && newColumn + cardSpan - 1 <= 8) {
      setCurrentColumn(newColumn);
    }

    const startColumn = newColumn > 8 - cardSpan + 1 ? 8 - cardSpan + 1 : newColumn; // limit column count
    // Send changed information to update projectg movement in backend
    const changeData = { playerId: playerId, projectId: single.project.id, startTime: startColumn, endTime: startColumn + cardSpan - 1 };
    setProjectUpdatedTime(startColumn);

    stompService.sendMessage(`/game/games/${gameId}/projectPlans/${id}/moveProject`, JSON.stringify(changeData));

    // data for trigger chat box
    const chatBoxData = {
      gameId,
      playerName: single.owner.name,
      demand: {
        time: startColumn,
      },
    };
    console.log(chatBoxData);
    stompService.sendMessage(`/game/timeLineChange/${gameId}`, JSON.stringify(chatBoxData));
  };
  console.log(currentColumn)
  return (
    <div
      className="months-con"
      style={{
        position: 'relative',
        margin: '0 auto', // Center the component horizontally
      }}
    >
      <ul className="months">
        {months.map((each, index) => (
          <ul className="each-month" key={index}>
            <li className="month-head">{each}</li>
            <li className="gap-con"></li>
            <li className="empty-con"></li>
            <li className="empty-con"></li>
            <li className="empty-con"></li>
          </ul>
        ))}
      </ul>

      <div>
        <Draggable
          nodeRef={nodeRef}
          axis="x"
          bounds={{
            left: 0,
            right: (8 - cardSpan) * ((window.innerWidth * 0.72) / 7), // Adjust bounds for 75% width
          }}
          grid={[(window.innerWidth * 0.78) / 7, (window.innerWidth * 0.78) / 7]} // Snap to column widths based on 75% width
          position={{ x: (currentColumn - 2) * ((window.innerWidth * 0.77) / 7), y: 0 }}
          onStop={handleDragStop}
        >
          <div
            ref={nodeRef}
            className="project-card-con"
            style={{
              position: 'absolute',
              width: `${cardSpan * 13.8}%`,
            }}
          >
            <ProjectCard single={project} projectStartEndTime={projectStartTime} />
          </div>
        </Draggable>
      </div>
    </div>
  );
};

export default ProjectView;