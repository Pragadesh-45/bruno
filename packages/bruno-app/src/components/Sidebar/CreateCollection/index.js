import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { browseDirectory } from 'providers/ReduxStore/slices/collections/actions';
import { createCollection } from 'providers/ReduxStore/slices/collections/actions';
import toast from 'react-hot-toast';
import Modal from 'components/Modal';
import { sanitizeName, validateName, validateNameError } from 'utils/common/regex';
import PathDisplay from 'components/PathDisplay/index';
import { useState } from 'react';
import { IconArrowBackUp } from '@tabler/icons';

const CreateCollection = ({ onClose }) => {
  const inputRef = useRef();
  const dispatch = useDispatch();
  const [isEditingFilename, toggleEditingFilename] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      collectionName: '',
      collectionFolderName: '',
      collectionLocation: ''
    },
    validationSchema: Yup.object({
      collectionName: Yup.string()
        .min(1, 'must be at least 1 character')
        .max(255, 'must be 255 characters or less')
        .required('collection name is required'),
      collectionFolderName: Yup.string()
        .min(1, 'must be at least 1 character')
        .max(255, 'must be 255 characters or less')
        .test('is-valid-dir-name', function(value) {
          const isValid = validateName(value);
          return isValid ? true : this.createError({ message: validateNameError(value) });
        })
        .required('folder name is required'),
      collectionLocation: Yup.string().min(1, 'location is required').required('location is required')
    }),
    onSubmit: (values) => {
      dispatch(createCollection(values.collectionName, values.collectionFolderName, values.collectionLocation))
        .then(() => {
          toast.success('Collection created!');
          onClose();
        })
        .catch((e) => toast.error('An error occurred while creating the collection - ' + e));
    }
  });

  const browse = () => {
    dispatch(browseDirectory())
      .then((dirPath) => {
        // When the user closes the diolog without selecting anything dirPath will be false
        if (typeof dirPath === 'string') {
          formik.setFieldValue('collectionLocation', dirPath);
        }
      })
      .catch((error) => {
        formik.setFieldValue('collectionLocation', '');
        console.error(error);
      });
  };

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const onSubmit = () => formik.handleSubmit();

  return (
    <Modal size="sm" title="Create Collection" confirmText="Create" handleConfirm={onSubmit} handleCancel={onClose}>
      <form className="bruno-form" onSubmit={e => e.preventDefault()}>
        <div>
          <label htmlFor="collection-name" className="flex items-center font-semibold">
            Name
          </label>
          <input
            id="collection-name"
            type="text"
            name="collectionName"
            ref={inputRef}
            className="block textbox mt-2 w-full"
            onChange={(e) => {
              formik.handleChange(e);
              !isEditingFilename && formik.setFieldValue('collectionFolderName', sanitizeName(e.target.value));
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            value={formik.values.collectionName || ''}
          />
          {formik.touched.collectionName && formik.errors.collectionName ? (
            <div className="text-red-500">{formik.errors.collectionName}</div>
          ) : null}

          <label htmlFor="collection-location" className="block font-semibold mt-3">
            Location
          </label>
          <input
            id="collection-location"
            type="text"
            name="collectionLocation"
            readOnly={true}
            className="block textbox mt-2 w-full cursor-pointer"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            value={formik.values.collectionLocation || ''}
            onClick={browse}
          />
          {formik.touched.collectionLocation && formik.errors.collectionLocation ? (
            <div className="text-red-500">{formik.errors.collectionLocation}</div>
          ) : null}
          <div className="mt-1">
            <span className="text-link cursor-pointer hover:underline" onClick={browse}>
              Browse
            </span>
          </div>
          {isEditingFilename ?
             <>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="filename" className="block font-semibold">
                    Directory Name
                  </label>
                  <IconArrowBackUp 
                    className="cursor-pointer opacity-50 hover:opacity-80" 
                    size={16} 
                    strokeWidth={1.5} 
                    onClick={() => toggleEditingFilename(false)} 
                  />
                </div>
                <input
                  id="collection-folder-name"
                  type="text"
                  name="collectionFolderName"
                  className="block textbox mt-2 w-full"
                  onChange={formik.handleChange}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  value={formik.values.collectionFolderName || ''}
                />
              </div>
            </>
          : 
            <PathDisplay
              filename={formik.values.collectionFolderName}
              showExtension={false}
              isEditingFilename={isEditingFilename}
              toggleEditingFilename={toggleEditingFilename}
            />
          }
          {formik.touched.collectionFolderName && formik.errors.collectionFolderName ? (
            <div className="text-red-500">{formik.errors.collectionFolderName}</div>
          ) : null}
        </div>
      </form>
    </Modal>
  );
};

export default CreateCollection;
