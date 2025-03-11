import trim from 'lodash/trim';
import path from 'path';
import slash from './slash';
import platform from 'platform';
import brunoPath from '@usebruno/path';

export const isElectron = () => {
  if (!window) {
    return false;
  }

  return window.ipcRenderer ? true : false;
};

export const resolveRequestFilename = (name) => {
  return `${trim(name)}.bru`;
};

export const getSubdirectoriesFromRoot = (rootPath, pathname) => {
  const relativePath = brunoPath.relative(rootPath, pathname);
  return relativePath ? relativePath.split(/[/\\]/) : [];
};

export const isWindowsPath = (pathname) => {
  return brunoPath.isWindowsPath(pathname);
};

export const getDirectoryName = (pathname) => {
  return brunoPath.dirname(pathname);
};

export const isWindowsOS = () => {
  const os = platform.os;
  const osFamily = os.family.toLowerCase();

  return osFamily.includes('windows');
};

export const isMacOS = () => {
  const os = platform.os;
  const osFamily = os.family.toLowerCase();

  return osFamily.includes('os x');
};

export const getAppInstallDate = () => {
  let dateString = localStorage.getItem('bruno.installedOn');

  if (!dateString) {
    dateString = new Date().toISOString();
    localStorage.setItem('bruno.installedOn', dateString);
  }

  const date = new Date(dateString);
  return date;
};
