import { HiArrowLongLeft } from 'react-icons/hi2';
import './header.css';

interface propsType {
  heading: string;
}
const Header: React.FC<propsType> = (props) => {
  const { heading } = props;
  return (
    <div className="title-board">
      <img src="https://res.cloudinary.com/dwc2npg5b/image/upload/v1728296699/images-removebg-preview_nflcup.png" alt="bord-logo" className="board-logo" />
      <h1 className="resourceboard-title">{heading}</h1>
      <div className="time-arrow">
        <HiArrowLongLeft className="arrow-icon" />
        <h2 className="resourceboard-time">Time (t)</h2>
      </div>
    </div>
  );
};

export default Header;
