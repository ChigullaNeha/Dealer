import { BsSuitSpadeFill } from 'react-icons/bs';
import { FaHeart } from 'react-icons/fa';
import { FaDiamond } from 'react-icons/fa6';
import { ResourceCardType } from '../../types/types';
import './resourceCard.css';
//Interface for the card object
interface propsType {
  skillValue: string;
  resources: ResourceCardType[];
}

const timeArray = [8, 7, 6, 5, 4, 3, 2];

const ResourceCard: React.FC<propsType> = (props) => {
  const { skillValue, resources } = props;

  const getAppropriateIcon = (className: string, skillValue: string) => {
    if (skillValue === 'HEART') {
      return <FaHeart className={className} />;
    } else if (skillValue === 'SPADE') {
      return <BsSuitSpadeFill className={` ${className === 'heart2' ? 'spade-styling' : ''}  ${className}`} />;
    } else {
      return <FaDiamond className={className} />;
    }
  };

  const backgroundCssForSymbolBackground = skillValue === 'SPADE' ? 'each1' : '';

  return (
    <div className="resource-cards-background-container">
      <div className="resourceboard">
        {/* Creating an array of size 7 to map through and createing layout */}
        {timeArray.map((time) => {
          return (
            <div className="card-container" key={time}>
              {resources.map((item) => {
                if (item.time === time) {
                  return (
                    <div className="resource-card" key={item.id}>
                      <div className="resource-details">
                        <div className={`each card12  ${backgroundCssForSymbolBackground}`}>
                          <h2 className="time">
                            {' '}
                            {getAppropriateIcon('heart', skillValue)}
                            <br />
                            {item.time}
                          </h2>
                        </div>
                        <div className="card22">
                          <h5 className="name" style={{ color: '#808080' }}>
                            {item.name}
                            <br />
                            {getAppropriateIcon('heart2', skillValue)}
                          </h5>
                        </div>
                        <div className={`each card32  ${backgroundCssForSymbolBackground}`}>
                          <h2 className="time">
                            {item.time}
                            <br />
                            {getAppropriateIcon('heart', skillValue)}
                          </h2>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ResourceCard;
