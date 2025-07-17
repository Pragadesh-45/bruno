import styled from 'styled-components';

const StyledWrapper = styled.div`
  .collection-dropdown {
    color: ${(props) => props.theme.sidebar.dropdownIcon.color};

    &:hover {
      color: inherit;
    }

    .tippy-box {
      top: -0.5rem;
      position: relative;
      user-select: none;
    }
  }

  .collapse-button {
    color: ${(props) => props.theme.sidebar.dropdownIcon.color};

    &:hover {
      color: ${(props) => props.theme.sidebar.color};
      background-color: ${(props) => props.theme.sidebar.collection.item.hoverBg};
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;

export default StyledWrapper;
