import { CirclesWithBar } from 'react-loader-spinner'

import "./loader.css"

const Loader = () => <div className='loader-container'>
    <CirclesWithBar
        height="100"
        width="100"
        color="#ffffff"
        outerCircleColor="#ffffff"
        innerCircleColor="#ffffff"
        barColor="#ffffff"
        ariaLabel="circles-with-bar-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
    />
</div>

export default Loader;