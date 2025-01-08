import React, { useCallback } from 'react';
import get from 'lodash/get';
import { useTheme } from 'providers/Theme';
import { useDispatch } from 'react-redux';
import SingleLineEditor from 'components/SingleLineEditor';
import { updateCollectionAuth } from 'providers/ReduxStore/slices/collections';
import { saveCollectionRoot } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';

const NTLMAuth = ({ collection }) => {
  const dispatch = useDispatch();
  const { storedTheme } = useTheme();
  const ntlmAuth = get(collection, 'root.request.auth.ntlm', { username: '', password: '', domain: '' });

  const handleSave = () => {
    dispatch(saveCollectionRoot({ uid: collection.uid }));
  };

  const handleFieldChange = useCallback((field) => (value) => {
    dispatch(
      updateCollectionAuth({
        mode: 'ntlm',
        collectionUid: collection.uid,
        content: {
          ...ntlmAuth,
          [field]: value
        }
      })
    );
  }, [dispatch, ntlmAuth, collection.uid]);

  return (
    <StyledWrapper className="mt-2 w-full">
      <label className="block font-medium mb-2">Username</label>
      <div className="single-line-editor-wrapper mb-2">
        <SingleLineEditor
          value={ntlmAuth.username}
          theme={storedTheme}
          onSave={handleSave}
          onChange={handleFieldChange('username')}
          collection={collection}
        />
      </div>

      <label className="block font-medium mb-2">Password</label>
      <div className="single-line-editor-wrapper">
        <SingleLineEditor
          value={ntlmAuth.password}
          theme={storedTheme}
          onSave={handleSave}
          onChange={handleFieldChange('password')}
          collection={collection}
          isSecret={true}
        />
      </div>

      <label className="block font-medium mb-2">Domain</label>
      <div className="single-line-editor-wrapper">
        <SingleLineEditor
          value={ntlmAuth.domain}
          theme={storedTheme}
          onSave={handleSave}
          onChange={handleFieldChange('domain')}
          collection={collection}
        />
      </div>
    </StyledWrapper>
  );
};

export default NTLMAuth;
