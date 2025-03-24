import React from 'react';
import StyledWrapper from './StyledWrapper';

const ResponseWarning = ({ size, onReveal, onSave, onCopy, onRevealInBrowser }) => {
  // Convert bytes to MB and round to 1 decimal place
  const sizeInMB = (size / (1024 * 1024)).toFixed(1);

  return (
    <StyledWrapper className="response-warning-container">
      <div className="warning-content">
        <div className="warning-message">
          Showing responses over {sizeInMB} MB may impact performance
        </div>
        <div className="warning-actions">
          <button className="btn-reveal" onClick={onReveal}>
            Reveal Response
          </button>
          <button className="btn-secondary" onClick={onRevealInBrowser}>
            Reveal in Browser
          </button>
          <button className="btn-secondary" onClick={onSave}>
            Save to File
          </button>
          <button className="btn-secondary" onClick={onCopy}>
            Copy
          </button>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default ResponseWarning; 