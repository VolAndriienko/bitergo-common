import { LangsCookieConsentConfigurationInput } from 'langs-cookie-consent';
import { langs } from 'langs-navigation';

export const providers = {
  matomo: 'matomo',
  capterra: 'capterra',
  google_ads: 'google_ads',
  linked_in: 'linked_in',
  google_general: 'google_general'
};

const { capterra, google_ads, google_general, linked_in, matomo } = providers;

export const tabs = {
  measurement: 'measurement',
  marketing: 'marketing',
  others: 'others'
};

const { marketing, measurement, others } = tabs;

export const cookieConsentConfiguration: LangsCookieConsentConfigurationInput = {
  isLoggingEnabled: false,
  fallsbackLang: langs.en,
  header: 'header',
  text: 'text',
  buttons: {
    accept: 'accept-all',
    back: 'back',
    reject: 'reject-all',
    saveAndClose: 'save-and-close',
    acceptSome: 'save-and-close'
  },
  links: [
    { caption: 'privacy', navigate: 'privacy' },
    { caption: 'imprint', navigate: 'imprint' },
  ],
  revokeText: 'revokeText',
  settings: {
    caption: 'manage-cookie-setting',
    header: 'manage-settings.header',
    text: 'manage-settings.text',
    tabs: [
      {
        caption: 'measurement',
        text: 'measurement',
        id: measurement,
        providersHeader: 'provider',
        providers: [
          { id: matomo, caption: 'Matomo', },
        ]
      },
      {
        caption: 'marketing',
        text: 'marketing',
        id: marketing,
        providersHeader: 'provider',
        providers: [
          { id: google_ads, caption: 'Google Ads' },
          { id: linked_in, caption: 'LinkedIn' },
          { id: capterra, caption: 'Capterra' },
        ]
      },
      {
        caption: 'others',
        text: 'others',
        id: others,
        providersHeader: 'provider',
        providers: [{ id: google_general, caption: 'Google General' }]
      },
    ]
  }
}
