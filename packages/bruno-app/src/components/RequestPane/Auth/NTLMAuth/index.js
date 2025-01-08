import React, { useCallback } from 'react';
import get from 'lodash/get';
import { useTheme } from 'providers/Theme';
import { useDispatch } from 'react-redux';
import SingleLineEditor from 'components/SingleLineEditor';
import { updateAuth } from 'providers/ReduxStore/slices/collections';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';

const NTLMAuth = ({ item, collection }) => {
  const dispatch = useDispatch();
  const { storedTheme } = useTheme();

  const ntlmAuth = item.draft ? get(item, 'draft.request.auth.ntlm', { username: '', password: '', domain: '' }) : get(item, 'request.auth.ntlm', { username: '', password: '', domain: '' });

  const handleRun = () => dispatch(sendRequest(item, collection.uid));
  const handleSave = () => dispatch(saveRequest(item.uid, collection.uid));

  const handleAuthChange = useCallback((field) => (value) => {
    dispatch(
      updateAuth({
        mode: 'ntlm',
        collectionUid: collection.uid,
        itemUid: item.uid,
        content: {
          ...ntlmAuth,
          [field]: value
        }
      })
    );
  }, [ntlmAuth, collection.uid, item.uid]);

  return (
    <StyledWrapper className="mt-2 w-full">
      <label className="block font-medium mb-2">Username</label>
      <div className="single-line-editor-wrapper mb-2">
        <SingleLineEditor
          value={ntlmAuth.username}
          theme={storedTheme}
          onSave={handleSave}
          onChange={handleAuthChange('username')}
          onRun={handleRun}
          collection={collection}
          item={item}
        />
      </div>

      <label className="block font-medium mb-2">Password</label>
      <div className="single-line-editor-wrapper">
        <SingleLineEditor
          value={ntlmAuth.password}
          theme={storedTheme}
          onSave={handleSave}
          onChange={handleAuthChange('password')}
          onRun={handleRun}
          collection={collection}
          item={item}
          isSecret={true}
        />
      </div>

      <label className="block font-medium mb-2">Domain</label>
      <div className="single-line-editor-wrapper">
        <SingleLineEditor
          value={ntlmAuth.domain}
          theme={storedTheme}
          onSave={handleSave}
          onChange={handleAuthChange('domain')}
          onRun={handleRun}
          collection={collection}
          item={item}
        />
      </div>
    </StyledWrapper>
  );
};

export default NTLMAuth;
