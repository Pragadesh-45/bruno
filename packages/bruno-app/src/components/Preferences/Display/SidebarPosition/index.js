import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { savePreferences } from 'providers/ReduxStore/slices/app';
import { useDispatch, useSelector } from 'react-redux';
import StyledWrapper from './StyledWrapper';

const SidebarPosition = ({ close }) => {
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.app.preferences);
  const currentPosition = preferences?.layout?.sidebarPosition || 'left';

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      sidebarPosition: currentPosition
    },
    validationSchema: Yup.object({
      sidebarPosition: Yup.string().oneOf(['left', 'right']).required('Position is required')
    }),
    onSubmit: (values) => {
      handlePositionChange(values.sidebarPosition);
    }
  });

  const handlePositionChange = (position) => {
    const updatedPreferences = {
      ...preferences,
      layout: {
        ...preferences.layout,
        sidebarPosition: position
      }
    };

    dispatch(savePreferences(updatedPreferences))
      .then(() => {
        toast.success('Sidebar position updated successfully');
      })
      .catch(() => {
        toast.error('Failed to update sidebar position');
      });
  };

  return (
    <StyledWrapper>
      <div className="bruno-form">
        <div className="flex items-center mt-2">
          <input
            id="sidebar-left"
            className="cursor-pointer"
            type="radio"
            name="sidebarPosition"
            onChange={(e) => {
              formik.handleChange(e);
              formik.handleSubmit();
            }}
            value="left"
            checked={formik.values.sidebarPosition === 'left'}
          />
          <label htmlFor="sidebar-left" className="ml-1 cursor-pointer select-none">
            Left
          </label>

          <input
            id="sidebar-right"
            className="ml-4 cursor-pointer"
            type="radio"
            name="sidebarPosition"
            onChange={(e) => {
              formik.handleChange(e);
              formik.handleSubmit();
            }}
            value="right"
            checked={formik.values.sidebarPosition === 'right'}
          />
          <label htmlFor="sidebar-right" className="ml-1 cursor-pointer select-none">
            Right
          </label>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default SidebarPosition;