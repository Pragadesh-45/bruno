import TitleBar from './TitleBar';
import Collections from './Collections';
import StyledWrapper from './StyledWrapper';
import { useApp } from 'providers/App';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLeftSidebarWidth, updateIsDragging } from 'providers/ReduxStore/slices/app';
import { useTheme } from 'providers/Theme';

const MIN_LEFT_SIDEBAR_WIDTH = 221;
const MAX_LEFT_SIDEBAR_WIDTH = 600;

const Sidebar = () => {
  const leftSidebarWidth = useSelector((state) => state.app.leftSidebarWidth);
  const sidebarCollapsed = useSelector((state) => state.app.sidebarCollapsed);
  const { version } = useApp();
  const [asideWidth, setAsideWidth] = useState(leftSidebarWidth);

  const { storedTheme } = useTheme();

  const dispatch = useDispatch();
  const [dragging, setDragging] = useState(false);

  const handleMouseMove = (e) => {
    if (dragging && !sidebarCollapsed) {
      e.preventDefault();
      let width = e.clientX + 2;
      if (width < MIN_LEFT_SIDEBAR_WIDTH || width > MAX_LEFT_SIDEBAR_WIDTH) {
        return;
      }
      setAsideWidth(width);
    }
  };
  const handleMouseUp = (e) => {
    if (dragging) {
      e.preventDefault();
      setDragging(false);
      dispatch(
        updateLeftSidebarWidth({
          leftSidebarWidth: asideWidth
        })
      );
      dispatch(
        updateIsDragging({
          isDragging: false
        })
      );
    }
  };
  const handleDragbarMouseDown = (e) => {
    if (sidebarCollapsed) return; // Prevent dragging when collapsed
    e.preventDefault();
    setDragging(true);
    dispatch(
      updateIsDragging({
        isDragging: true
      })
    );
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragging, asideWidth]);

  useEffect(() => {
    setAsideWidth(leftSidebarWidth);
  }, [leftSidebarWidth]);

  // Use minimal width when collapsed, normal width when expanded
  const currentWidth = sidebarCollapsed ? 0 : asideWidth;

  return (
    <StyledWrapper className="flex relative h-full">
      <aside style={{ width: currentWidth, overflow: 'hidden' }}>
        <div className="flex flex-row h-full w-full">
          <div className="flex flex-col w-full" style={{ width: asideWidth }}>
            <div className="flex flex-col flex-grow">
              <TitleBar />
              <Collections />
            </div>
          </div>
        </div>
      </aside>

      {!sidebarCollapsed && (
        <div className="absolute drag-sidebar h-full" onMouseDown={handleDragbarMouseDown}>
          <div className="drag-request-border" />
        </div>
      )}
    </StyledWrapper>
  );
};

export default Sidebar;
