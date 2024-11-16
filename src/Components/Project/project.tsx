import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { BsFillSuitSpadeFill } from 'react-icons/bs';
import { FaDiamond } from 'react-icons/fa6';
import { GoHeartFill } from 'react-icons/go';
import { ImCross } from 'react-icons/im';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid';
import logo from '../../assets/texgo0cy.png';
import StompService from '../../StompService/stompService';
import { ProjectPlan, Request } from '../../types/types';
import ProjectView from '../ProjectView/projectView';
import './project.css';

interface ProjectManagerTyps {
  eachProject: ProjectPlan;
  setErrMsg: Dispatch<SetStateAction<string | null>>;
  onRequestFullfilled: (data: string) => void;
  request: Request | undefined;
}

const Project = (props: ProjectManagerTyps) => {
  const { eachProject, setErrMsg, onRequestFullfilled, request } = props;
  let months = [2, 3, 4, 5, 6, 7, 8];
  const { gameId } = useParams();
  let { cards, id, project, owner, projectStartTime } = eachProject;
  const [resourceIndex, setResourceIndex] = useState<number>();
  const [resourceSkill, setResourceSkill] = useState<string>();
  const [isRequested, setIsRequested] = useState<boolean>(false);
  const [projectUpdatedTime, setProjectUpdatedTime] = useState(eachProject.projectStartTime);
  const [showResourceCard, setShowResourceCard] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');

  const stompService = StompService.getInstance();

  useEffect(() => {
    if (request !== undefined) {
      setShowResourceCard(true);
      setRequestId(request.id);
      setIsRequested(false);
    }
  }, [request]);

  // Function to show request button when right clicked
  const showRequestBtn = (e: React.MouseEvent<HTMLDivElement>, month: number, skill: string) => {
    e.preventDefault();
    if (request) {
      toast.error('You can make one request at a time', {
        style: {
          borderRadius: '10px',
          background: '#333',
          fontSize: '18px',
          minWidth: '600px',
          textAlign: 'center',
          color: '#fff',
        },
        duration: 1500,
      });
      return;
    }
    let projectStartMonth = projectStartTime;
    const diffrence = project.initialFinishTime - project.initialStartTime;
    const projectEndTime = projectStartTime + diffrence;
    let isTrue = false;
    for (projectStartMonth; projectStartMonth <= projectEndTime; projectStartMonth++) {
      if (projectStartMonth === month) {
        isTrue = true;
      }
    }
    if (!isTrue) {
      toast.error('Please make a request from the project start month to project end month', {
        style: {
          borderRadius: '10px',
          background: '#333',
          fontSize: '18px',
          minWidth: '600px',
          textAlign: 'center',
          color: '#fff',
        },
        duration: 1500,
      });
      return;
    }

    setIsRequested(true);
    setResourceIndex(month);
    setResourceSkill(skill);
  };

  // Function to send a request to Resource Manager about which Resource you need
  const sendRequestToRM = async (month: number, skill: string) => {
    const resourceCardId = uuidv4();
    const resourceCard = {
      id: resourceCardId,
      projectPlanId: id,
      playerId: owner.id,
      demand: {
        time: month,
        skill: skill,
      },
    };

    // When PM sends request this will trigger for response

    stompService.subscribe('/topics/request', (message) => {
      const responseBody = JSON.parse(message.body);
      onRequestFullfilled('requested' + resourceCardId);
      if (responseBody.body === 'After Responding on you pending request you can make another request') {
        toast.error(responseBody.body, {
          style: {
            borderRadius: '10px',
            fontSize: '18px',
            minWidth: '600px',
            textAlign: 'center',
          },
          duration: 1500,
        });
      }
    });

    // When Resource Manager fullfilled request this will trigger
    stompService.subscribe(`/topics/fulFilledRequest/${id}`, (message) => {
      onRequestFullfilled(message.body);
    });

    // to send Reques to RM
    stompService.sendMessage(`/game/game/${gameId}/request/${id}`, JSON.stringify(resourceCard));
    const dataForChat = {
      playerName: owner.name,
      demand: resourceCard.demand,
    };
    stompService.sendMessage(`/game/requestForResource/${gameId}`, JSON.stringify(dataForChat));
    setShowResourceCard(true);
    setIsRequested(false);
    setRequestId(resourceCardId);
  };

  // Function to cancel a request when you don't that resource anymore
  const cancelTheRequest = async () => {
    setShowResourceCard(false);

    stompService.subscribe('/topics/revoked', (message) => {
      const responce = JSON.parse(message.body).body;
      onRequestFullfilled(responce);
      if (responce === 'Game Not Found') {
        setErrMsg(responce);
      }
      toast.success(responce, {
        style: {
          borderRadius: '10px',
          fontSize: '18px',
          minWidth: '600px',
          textAlign: 'center',
        },
        duration: 1500,
      });
    });

    stompService.sendMessage(`/game/game/${gameId}/request/${requestId}/return`, '');

    stompService.sendMessage(`/game/revokeRequest/${gameId}`, JSON.stringify({ gameId, playerName: owner.name }));
  };

  // To display the Resource Cards and basic UI to display month wise empty cards
  const renderCards = (skill: 'HEART' | 'DIAMOND' | 'SPADE', month: number) => {
    // it will filter the resource cards based on the time and skill
    const filteredCards = cards.filter((c) => c.time === month && c.skill === skill);
    // to display the ReactIcon based on skill
    const Icon = skill === 'HEART' ? GoHeartFill : skill === 'DIAMOND' ? FaDiamond : BsFillSuitSpadeFill;
    if (filteredCards.length > 0) {
      return (
        <div className={`cards card${skill === 'HEART' ? '1' : skill === 'DIAMOND' ? '2' : '3'}`} onContextMenu={(e) => showRequestBtn(e, month, skill)}>
          {/* to display request button only for the particular card based on the time and skill */}
          {isRequested === true && resourceIndex === month && resourceSkill === skill && (
            <div className="request-btn-container">
              <button className="request-btn" onClick={() => sendRequestToRM(month, skill)}>
                Request
              </button>
              <button className="cancel-request-btn request-btn">
                <ImCross onClick={() => setIsRequested(false)} style={{ fontSize: '11px' }} />
              </button>
            </div>
          )}
          {/* to show requested Resource Card only for the particular card based on the time and skill*/}
          {request !== undefined && request.demand.time === month && request.demand.skill === skill && showResourceCard === true && (
            <div className="request-resource-card-container">
              <div className="request-name-and-heart-container">
                <h3 className="requested skill-holder-name ">?</h3>
                <Icon className="request-name-and-heart" />
              </div>
              <div className="request-month-and-skill-container">
                <h2 className="month-details">{month}</h2>
                <Icon className="request-month-and-skill-heart" />
              </div>
              <div onClick={cancelTheRequest} className="cross-icon-container">
                <ImCross className="cross-icon" />
              </div>
            </div>
          )}
          {/* to display filtered cards in the UI */}
          {filteredCards.map((card, cardIndex) => (
            <div
              key={cardIndex}
              className="resource-card-container"
              style={{
                position: 'absolute',
                top: filteredCards.length === 1 ? '50px' : cardIndex === 0 ? '5px' : `${cardIndex * 19}px`,
                left: filteredCards.length === 1 ? '35px' : cardIndex === 0 ? '10px' : cardIndex >= 3 ? `${(cardIndex - 2.8) * 25}px` : `${cardIndex * 25}px`,
              }}
            >
              <div className={`${skill === `HEART` || skill === `DIAMOND` ? `name-and-heart-container ` : `name-and-heart-container `}`}>
                <h5 className="skill-holder-name">{card.name}</h5>
                <span>
                  <Icon className={`${skill === 'HEART' || skill === 'DIAMOND' ? `red-color name-and-heart ` : `black-color name-and-heart `}`} />
                </span>
              </div>
              <div
                className={`${skill === `HEART` || skill === `DIAMOND` ? `month-and-skill-container red-color-backgound` : `month-and-skill-container black-color-backgound`}`}
              >
                <h2 className="month-details">{card.time}</h2>
                <Icon className={`${skill === `HEART` || skill === `DIAMOND` ? `red-color month-and-skill-heart ` : `black-color month-and-skill-heart`}`} />
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        // to display empty cards
        <div className={`cards card${skill === 'HEART' ? '1' : skill === 'DIAMOND' ? '2' : '3'}`} onContextMenu={(e) => showRequestBtn(e, month, skill)}>
          <Icon style={{ color: 'rgb(108, 111, 138)', fontSize: '30px' }} />
          {/* to display request button only for the particular card based on the time and skill */}
          {isRequested === true && resourceIndex === month && resourceSkill === skill && (
            <div className="request-btn-container">
              <button className="request-btn" onClick={() => sendRequestToRM(month, skill)}>
                Request
              </button>
              <button onClick={() => setIsRequested(false)} className="cancel-request-btn request-btn">
                <ImCross style={{ fontSize: '11px' }} />
              </button>
            </div>
          )}
          {/* to show requested Resource Card only for the particular card based on the time and skill*/}
          {request !== undefined && request.demand.time === month && request.demand.skill === skill && showResourceCard === true && (
            <div className="request-resource-card-container">
              <div className="request-name-and-heart-container">
                <h3 className="requested skill-holder-name ">?</h3>
                <Icon className="request-name-and-heart" />
              </div>
              <div className="request-month-and-skill-container">
                <h2 className="month-details">{month}</h2>
                <Icon className="request-month-and-skill-heart" />
              </div>
              <div onClick={cancelTheRequest} className="cross-icon-container">
                <ImCross className="cross-icon" />
              </div>
            </div>
          )}
        </div>
      );
    }
  };
  return (
    <div className="project-display">
      <div className="time-container">
        <p className="plan-title">Time (t) ——＞</p>
        <h3 className="plan-title">Project Plan</h3>
        <img className="logo-image" src={logo} alt="company-logo" />
      </div>
      <ProjectView single={eachProject} setProjectUpdatedTime={setProjectUpdatedTime} />
      <div>
        {cards !== undefined && (
          <div className="resource-card-main-container">
            {months.map((month) => (
              <div key={month} className="cards-container">
                {/* calling the renderCards Function with passing arguments skill and time */}
                {renderCards('HEART', month)}
                {renderCards('DIAMOND', month)}
                {renderCards('SPADE', month)}
              </div>
            ))}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default Project;