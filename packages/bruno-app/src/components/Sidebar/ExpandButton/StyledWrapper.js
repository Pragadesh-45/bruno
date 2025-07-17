import styled from 'styled-components';

const Wrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }

  .expand-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: ${(props) => props.theme.sidebar.bg};
    border: 1px solid ${(props) => props.theme.sidebar.search.border};
    border-radius: 6px;
    color: ${(props) => props.theme.sidebar.dropdownIcon.color};
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &:hover {
      color: ${(props) => props.theme.sidebar.color};
      background-color: ${(props) => props.theme.sidebar.collection.item.hoverBg};
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;

export default Wrapper;