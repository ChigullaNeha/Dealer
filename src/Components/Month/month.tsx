import { MdAccessTimeFilled } from 'react-icons/md';

import './month.css';

const months: string[] = ['8', '7', '6', '5', '4', '3', '2'];

const Month: React.FC = (): JSX.Element => (
  <div className="table-container">
    <table className="table-month-con">
      <thead>
        <tr>
          {months.map((each) => (
            <th className="month-container" key={each}>
              <p className="month-content-container">
                {each}
                {each === '2' && <MdAccessTimeFilled className="clock-iconn" />}
              </p>
            </th>
          ))}
        </tr>
      </thead>
    </table>
  </div>
);
export default Month;
