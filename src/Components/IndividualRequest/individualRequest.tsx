import { Client } from '@stomp/stompjs';

import { RequestType, ResourceBoardType } from '../../types/types';

import { useParams } from 'react-router-dom';

//bharath
import StompService from '../../StompService/stompService';

import './individualRequest.css';

const monthlyRequests: string[] = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface propsType {
  playerName: string;
  displayRequest: RequestType | null;
  stompClient: Client | null;
  resourceBoard: ResourceBoardType;
  isWebSocketConnected: boolean;
  isResourceCardExist(time: number): boolean;
}

const IndividualRequest: React.FC<propsType> = (props): JSX.Element => {
  const { playerName, displayRequest, stompClient, resourceBoard, isResourceCardExist, isWebSocketConnected } = props;

  const { gameId } = useParams();

  //Bharath

  const stompService = StompService.getInstance();

  const onFulFillingTheRequest = (displayRequest: RequestType) => {
    //bha
    if (isWebSocketConnected) {
      const rbRequest = {
        resourceBoardId: resourceBoard.id,
        request: displayRequest,
      };
      stompService.sendMessage(`/game/games/${gameId}/fulFillingRequest`, JSON.stringify(rbRequest));

      const messageDetails = {
        gameId: 'Game1',
        playerName: resourceBoard.owner.name,
        demand: displayRequest.demand,
        recieverName: playerName,
      };
      stompService.sendMessage(`/game/sendingResourceCard/${gameId}`, JSON.stringify(messageDetails));
    }
  };

  const onCannotFulFillRequest = (displayRequest: RequestType) => {
    if (stompService) {
      const messageDetails = {
        gameId: gameId,
        playerName: `${resourceBoard.owner.name}(${resourceBoard.title})`,
        demand: displayRequest.demand,
        receiverName: playerName,
      };
      console.log(messageDetails);
      stompService.sendMessage(`/game/noResourceCardAvailable/${gameId}`, JSON.stringify(messageDetails));
    }
  };

  return (
    <tr style={{ backgroundColor: '#665ecb' }} className="body-row">
      {monthlyRequests.map((each) => {
        if (each == '1') {
          return (
            <td key={each} className="guide-data">
              Requested By {playerName}
            </td>
          );
        } else {
          const requestValue = displayRequest != null && displayRequest.demand.time === parseInt(each);
          return (
            <td key={each} className="request-visible-areas">
              {requestValue ? (
                <>
                  {isResourceCardExist(parseInt(each)) ? (
                    <button
                      type="button"
                      className="tick-btn"
                      onClick={() => {
                        onFulFillingTheRequest(displayRequest);
                      }}
                    >
                      <img
                        src="https://res.cloudinary.com/dlwlnr20m/image/upload/v1728389265/flat-round-check-mark-green-260nw-652023034-removebg-preview_xqay6g.png"
                        alt="tick-image"
                        className="tick-image"
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="tick-btn"
                      onClick={() => {
                        onCannotFulFillRequest(displayRequest);
                      }}
                    >
                      <img
                        src="https://res.cloudinary.com/dwc2npg5b/image/upload/v1729328362/Flat_cross_icon.svg_ofmsb0.png"
                        alt="tick-image"
                        className="tick-image"
                      />
                    </button>
                  )}
                </>
              ) : null}
            </td>
          );
        }
      })}
    </tr>
  );
};
export default IndividualRequest;
