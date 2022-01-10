import { MatomoModuleConfiguration, defaultConfiguration } from 'ngx-matomo';

export const matomoConfiguration: MatomoModuleConfiguration = {
  requireConsent: true,
  scriptUrl: '/assets/scripts/matomo.js',
  scriptVersion: defaultConfiguration.scriptVersion || 1,
  trackers: [
    {
      trackerUrl: 'https://piwik.logistics-mall.com/matomo.php',
      siteId: 28
    }
  ],
  routeTracking: {
    enable: true
  }
};
