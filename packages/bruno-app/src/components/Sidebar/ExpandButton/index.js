import React from 'react';
import { IconChevronRight } from '@tabler/icons';
import { useDispatch } from 'react-redux';
import { toggleSidebarCollapse } from 'providers/ReduxStore/slices/app';
import StyledWrapper from './StyledWrapper';

const ExpandButton = () => {
  const dispatch = useDispatch();

  const handleExpandSidebar = () => {
    dispatch(toggleSidebarCollapse());
  };

  return (
    <StyledWrapper>
      <button
        className="expand-button"
        onClick={handleExpandSidebar}
        title="Expand Sidebar (Ctrl/Cmd + ←)"
      >
        <IconChevronRight size={16} />
      </button>
    </StyledWrapper>
  );
};

export default ExpandButton;