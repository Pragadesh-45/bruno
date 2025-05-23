/**
 * Telemetry in bruno is just an anonymous visit counter (triggered once per day).
 * The only details shared are:
 *      - OS (ex: mac, windows, linux)
 *      - Bruno Version (ex: 1.3.0)
 * We don't track usage analytics / micro-interactions / crash logs / anything else.
 */

import { useEffect } from 'react';
import { PostHog } from 'posthog-node';
import platformLib from 'platform';
import { uuid } from 'utils/common';

const posthogApiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
let posthogClient = null;

const isPlaywrightTestRunning = () => {
  return process.env.PLAYWRIGHT ? true : false;
};

const isDevEnv = () => {
  return import.meta.env.MODE === 'development';
};

const getPosthogClient = () => {
  if (posthogClient) {
    return posthogClient;
  }

  posthogClient = new PostHog(posthogApiKey);
  return posthogClient;
};

const getAnonymousTrackingId = () => {
  let id = localStorage.getItem('bruno.anonymousTrackingId');

  if (!id || !id.length || id.length !== 21) {
    id = uuid();
    localStorage.setItem('bruno.anonymousTrackingId', id);
  }

  return id;
};

const trackStart = (version) => {
  if (isPlaywrightTestRunning()) {
    return;
  }

  if (isDevEnv()) {
    return;
  }

  const trackingId = getAnonymousTrackingId();
  const client = getPosthogClient();
  client.capture({
    distinctId: trackingId,
    event: 'start',
    properties: {
      os: platformLib.os.family,
      version: version
    }
  });
};

const useTelemetry = ({ version }) => {
  useEffect(() => {
    if (posthogApiKey && posthogApiKey.length) {
      trackStart(version);
      setInterval(trackStart, 24 * 60 * 60 * 1000);
    }
  }, [posthogApiKey]);
};

export default useTelemetry;
