import { useMemo } from 'react';
import { FaRegClock } from 'react-icons/fa';
import { FaDiamond, FaHeart } from 'react-icons/fa6';
import { ImSpades } from 'react-icons/im';
import { projectType } from '../../types/types';
import './projectCard.css';

// Props data type for Project card
type projectPropsType = {
  single: projectType;
  projectStartEndTime: number;
};

interface FrequencyCounter {
  [key: string]: number; // The key is the string, and the value is the frequency
}

// Change demands data formate
const changeDataFormate = (data: projectType) => {
  const newDemandsList: FrequencyCounter[] = [];
  for (let i = 0; i < data.initialFinishTime - data.initialStartTime + 1; i++) {
    let obj: FrequencyCounter = { HEART: 0, DIAMOND: 0, SPADE: 0 };
    for (let j = 0; j < data.demands.length; j++) {
      // To check time
      if (i === data.demands[j].time) {
        // If obj has that data already then increase count
        obj[data.demands[j].skill]++;
      }
    }
    newDemandsList.push(obj);
  }
  return newDemandsList;
};

const ProjectCard = (props: projectPropsType) => {
  const { single, projectStartEndTime } = props;
  const dataFormat = useMemo(() => {
    return changeDataFormate(single);
  }, []);
  const dataFormatLength = dataFormat.length;
  return (
    <>
      <nav className="project-head" style={{ fontSize: `${dataFormatLength * 3.5}px` }}>
        <h2 style={{ fontSize: '12px', fontFamily: 'sans-serif', marginTop: '3.5px' }}>{single.name}</h2>
        <div className="time-container-card">
          <FaRegClock style={{ fontSize: `${dataFormatLength * 5}px` }} />
          <p style={{ fontSize: `${dataFormatLength * 4.5}px`, marginTop: '2px' }}>
            {projectStartEndTime} - {projectStartEndTime + single.initialFinishTime - single.initialStartTime}
          </p>
        </div>
      </nav>
      <ul className="months">
        {dataFormat.map((each, index) => (
          <ul className="each-demand-con" key={index}>
            <li className="empty-con">
              {each.HEART > 0 && (
                <p>
                  {each.HEART} x <FaHeart className="heart-icon" />
                </p>
              )}
            </li>
            <li className="empty-con">
              {each.DIAMOND > 0 && (
                <p>
                  {each.DIAMOND} x <FaDiamond className="heart-icon" />
                </p>
              )}
            </li>
            <li className="empty-con">
              {each.SPADE > 0 && (
                <p>
                  {each.SPADE} x <ImSpades />
                </p>
              )}
            </li>
          </ul>
        ))}
      </ul>
    </>
  );
};

export default ProjectCard;
