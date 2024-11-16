import './errorResponse.css';

interface ErrorType {
  errorMsg: string;
}

const ErrorResponse = (props: ErrorType) => {
  const { errorMsg } = props;
  return (
    <div className="error-response-container">
      <div className="error-msg-inner-container">
        <h2 className="error-response-msg">{errorMsg}</h2>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorResponse;
