import styled from 'styled-components';

const StyledWrapper = styled.div`
  .response-warning-container {
    padding: 1.5rem;
  }

  .warning-content {
    background: ${props => props.theme.bg === '#1e1e1e' ? 'rgba(40, 40, 40, 0.5)' : 'rgba(250, 250, 250, 0.9)'};
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .warning-message {
    font-size: 1rem;
    color: ${props => props.theme.text};
    margin-bottom: 1rem;
  }

  .warning-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .btn-reveal {
    background: ${props => props.theme.colors.primary};
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      opacity: 0.9;
    }
  }

  .btn-secondary {
    background: transparent;
    color: ${props => props.theme.text};
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    border: 1px solid ${props => props.theme.border};
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background: ${props => props.theme.bg === '#1e1e1e' ? 'rgba(60, 60, 60, 0.5)' : 'rgba(240, 240, 240, 0.9)'};
    }
  }
`;

export default StyledWrapper; 