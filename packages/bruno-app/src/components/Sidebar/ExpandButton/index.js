import React from 'react';
import { IconChevronRight, IconChevronLeft } from '@tabler/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebarCollapse } from 'providers/ReduxStore/slices/app';
import StyledWrapper from './StyledWrapper';

const ExpandButton = () => {
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.app.preferences);
  const sidebarPosition = preferences?.layout?.sidebarPosition || 'left';

  const handleExpandSidebar = () => {
    dispatch(toggleSidebarCollapse());
  };

  return (
    <StyledWrapper className={sidebarPosition === 'right' ? 'sidebar-right' : ''}>
      <button
        className="expand-button"
        onClick={handleExpandSidebar}
        title={`Expand Sidebar (Ctrl/Cmd + ${sidebarPosition === 'right' ? '→' : '←'})`}
      >
        {sidebarPosition === 'right' ? (
          <IconChevronLeft size={16} />
        ) : (
          <IconChevronRight size={16} />
        )}
      </button>
    </StyledWrapper>
  );
};

export default ExpandButton;