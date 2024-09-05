import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import find from 'lodash/find';
import Mousetrap from 'mousetrap';
import { useSelector, useDispatch } from 'react-redux';
import SaveRequest from 'components/RequestPane/SaveRequest';
import EnvironmentSettings from 'components/Environments/EnvironmentSettings';
import NetworkError from 'components/ResponsePane/NetworkError';
import NewRequest from 'components/Sidebar/NewRequest';
import { sendRequest, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { findCollectionByUid, findItemInCollection } from 'utils/collections';
import { CTRL_TAB_ACTIONS, closeTabs, switchTab, ctrlTab} from 'providers/ReduxStore/slices/tabs';

export const HotkeysContext = React.createContext();

export const HotkeysProvider = (props) => {
  const dispatch = useDispatch();
  const tabs = useSelector((state) => state.tabs.tabs);
  const collections = useSelector((state) => state.collections.collections);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const isEnvironmentSettingsModalOpen = useSelector((state) => state.app.isEnvironmentSettingsModalOpen);
  const [showSaveRequestModal, setShowSaveRequestModal] = useState(false);
  const [showEnvSettingsModal, setShowEnvSettingsModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [tabPressCount, setTabPressCount] = useState(0);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  const getCurrentCollectionItems = () => {
    const activeTab = find(tabs, (t) => t.uid === activeTabUid);
    if (activeTab) {
      const collection = findCollectionByUid(collections, activeTab.collectionUid);

      return collection ? collection.items : [];
    }
  };

  const getCurrentCollection = () => {
    const activeTab = find(tabs, (t) => t.uid === activeTabUid);
    if (activeTab) {
      const collection = findCollectionByUid(collections, activeTab.collectionUid);

      return collection;
    }
  };

  // save hotkey
  useEffect(() => {
    Mousetrap.bind(['command+s', 'ctrl+s'], (e) => {
      if (isEnvironmentSettingsModalOpen) {
        console.log('todo: save environment settings');
      } else {
        const activeTab = find(tabs, (t) => t.uid === activeTabUid);
        if (activeTab) {
          const collection = findCollectionByUid(collections, activeTab.collectionUid);
          if (collection) {
            const item = findItemInCollection(collection, activeTab.uid);
            if (item && item.uid) {
              dispatch(saveRequest(activeTab.uid, activeTab.collectionUid));
            } else {
              // todo: when ephermal requests go live
              // setShowSaveRequestModal(true);
            }
          }
        }
      }

      return false; // this stops the event bubbling
    });

    return () => {
      Mousetrap.unbind(['command+s', 'ctrl+s']);
    };
  }, [activeTabUid, tabs, saveRequest, collections, isEnvironmentSettingsModalOpen]);

  // send request (ctrl/cmd + enter)
  useEffect(() => {
    Mousetrap.bind(['command+enter', 'ctrl+enter'], (e) => {
      const activeTab = find(tabs, (t) => t.uid === activeTabUid);
      if (activeTab) {
        const collection = findCollectionByUid(collections, activeTab.collectionUid);

        if (collection) {
          const item = findItemInCollection(collection, activeTab.uid);
          if (item) {
            dispatch(sendRequest(item, collection.uid)).catch((err) =>
              toast.custom((t) => <NetworkError onClose={() => toast.dismiss(t.id)} />, {
                duration: 5000
              })
            );
          }
        }
      }

      return false; // this stops the event bubbling
    });

    return () => {
      Mousetrap.unbind(['command+enter', 'ctrl+enter']);
    };
  }, [activeTabUid, tabs, saveRequest, collections]);

  // edit environments (ctrl/cmd + e)
  useEffect(() => {
    Mousetrap.bind(['command+e', 'ctrl+e'], (e) => {
      const activeTab = find(tabs, (t) => t.uid === activeTabUid);
      if (activeTab) {
        const collection = findCollectionByUid(collections, activeTab.collectionUid);

        if (collection) {
          setShowEnvSettingsModal(true);
        }
      }

      return false; // this stops the event bubbling
    });

    return () => {
      Mousetrap.unbind(['command+e', 'ctrl+e']);
    };
  }, [activeTabUid, tabs, collections, setShowEnvSettingsModal]);

  // new request (ctrl/cmd + b)
  useEffect(() => {
    Mousetrap.bind(['command+b', 'ctrl+b'], (e) => {
      const activeTab = find(tabs, (t) => t.uid === activeTabUid);
      if (activeTab) {
        const collection = findCollectionByUid(collections, activeTab.collectionUid);

        if (collection) {
          setShowNewRequestModal(true);
        }
      }

      return false; // this stops the event bubbling
    });

    return () => {
      Mousetrap.unbind(['command+b', 'ctrl+b']);
    };
  }, [activeTabUid, tabs, collections, setShowNewRequestModal]);

  // close tab hotkey
  useEffect(() => {
    Mousetrap.bind(['command+w', 'ctrl+w'], (e) => {
      dispatch(
        closeTabs({
          tabUids: [activeTabUid]
        })
      );

      return false; // this stops the event bubbling
    });

    return () => {
      Mousetrap.unbind(['command+w', 'ctrl+w']);
    };
  }, [activeTabUid]);

  // switch tab hotkey
  useEffect(() => {
    // Handle Ctrl keydown
    Mousetrap.bind(
      'ctrl',
      () => {
        setIsCtrlPressed(true);
        setTabPressCount(0);
      },
      'keydown'
    );

    // Handle Ctrl+Tab keydown
    Mousetrap.bind(
      'ctrl+tab',
      (e) => {
        if (isCtrlPressed) {
          setTabPressCount((prevCount) => prevCount + 1);
          if ((tabPressCount + 1) === 1) {
            dispatch(ctrlTab(CTRL_TAB_ACTIONS.ENTER));
          } else {
            // Dispatch `plus` action on subsequent presses
            dispatch(ctrlTab(CTRL_TAB_ACTIONS.PLUS));
          }
          e.preventDefault(); // Prevent default tab switching behavior
        }
      },
      'keydown'
    );

    // Handle Ctrl keyup
    Mousetrap.bind(
      'ctrl',
      () => {
        if (isCtrlPressed) {
          dispatch(ctrlTab(CTRL_TAB_ACTIONS.SWITCH));
          setIsCtrlPressed(false);
          setTabPressCount(0);
        }
      },
      'keyup'
    );

    // Cleanup Mousetrap bindings when the component unmounts
    return () => {
      Mousetrap.unbind('ctrl', 'keydown');
      Mousetrap.unbind('ctrl+tab', 'keydown');
      Mousetrap.unbind('ctrl', 'keyup');
    };
  }, [isCtrlPressed, tabPressCount]);

  // Switch to the previous tab
  useEffect(() => {
    Mousetrap.bind(['command+pageup', 'ctrl+pageup'], (e) => {
      dispatch(
        switchTab({
          direction: 'pageup'
        })
      );

      return false; // this stops the event bubbling
    });

    return () => {
      Mousetrap.unbind(['command+pageup', 'ctrl+pageup']);
    };
  }, [dispatch]);

  // Switch to the next tab
  useEffect(() => {
    Mousetrap.bind(['command+pagedown', 'ctrl+pagedown'], (e) => {
      dispatch(
        switchTab({
          direction: 'pagedown'
        })
      );

      return false; // this stops the event bubbling
    });

    return () => {
      Mousetrap.unbind(['command+pagedown', 'ctrl+pagedown']);
    };
  }, [dispatch]);

  // Close all tabs
  useEffect(() => {
    Mousetrap.bind(['command+shift+w', 'ctrl+shift+w'], (e) => {
      const activeTab = find(tabs, (t) => t.uid === activeTabUid);
      if (activeTab) {
        const collection = findCollectionByUid(collections, activeTab.collectionUid);

        if (collection) {
          const tabUids = tabs.filter((tab) => tab.collectionUid === collection.uid).map((tab) => tab.uid);
          dispatch(
            closeTabs({
              tabUids: tabUids
            })
          );
        }
      }

      return false; // this stops the event bubbling
    });

    return () => {
      Mousetrap.unbind(['command+shift+w', 'ctrl+shift+w']);
    };
  }, [activeTabUid, tabs, collections, dispatch]);

  return (
    <HotkeysContext.Provider {...props} value="hotkey">
      {showSaveRequestModal && (
        <SaveRequest items={getCurrentCollectionItems()} onClose={() => setShowSaveRequestModal(false)} />
      )}
      {showEnvSettingsModal && (
        <EnvironmentSettings collection={getCurrentCollection()} onClose={() => setShowEnvSettingsModal(false)} />
      )}
      {showNewRequestModal && (
        <NewRequest collection={getCurrentCollection()} onClose={() => setShowNewRequestModal(false)} />
      )}
      <div>{props.children}</div>
    </HotkeysContext.Provider>
  );
};

export const useHotkeys = () => {
  const context = React.useContext(HotkeysContext);

  if (!context) {
    throw new Error(`useHotkeys must be used within a HotkeysProvider`);
  }

  return context;
};

export default HotkeysProvider;
