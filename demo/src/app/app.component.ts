import { AfterViewInit, Component } from '@angular/core';
import { NavigationService } from 'langs-navigation';
import AOS from 'aos';
import { ProviderService } from '../../../bitergo-common/src/public-api';
import { CookieStatusNotificationService } from 'langs-cookie-consent';
import { providers } from './langs-cookie-consent.configuration';
import { MatomoTracker } from 'ngx-matomo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  tagManagerScriptSource = 'https://www.googletagmanager.com/gtag/js?id=AW-111111111';
  gtagScriptSource = '/assets/scripts/gtag.js';

  linkedInScriptSource = '/assets/scripts/linkedin.js';
  linkedInNoScriptSource = 'https://px.ads.linkedin.com/collect/?pid=111111111&fmt=gif';

  get isMatomoAllowed() {
    return this.cookieStatus.isProviderAllowed(providers.matomo);
  }

  get isGoogleAddsAllowed() {
    return this.cookieStatus.isProviderAllowed(providers.google_ads);
  };

  get isLinkedInAllowed() {
    return this.cookieStatus.isProviderAllowed(providers.linked_in);
  }

  testMatomo() {
    this.matomo.trackEvent('test', 'test',)
  }

  constructor(
    private nav: NavigationService,
    private matomo: MatomoTracker,
    private providerService: ProviderService,
    private cookieStatus: CookieStatusNotificationService,
  ) {
    const { accepted, closed, rejected } = this.cookieStatus;

    this.providerService.update({
      isEnabledLogging: true,
      providers: [
        {
          isAllowedPredicate: () => this.isMatomoAllowed,
          actions: [{
            onAllow: () => this.matomo.rememberConsentGiven(),
            onDisallow: () => this.matomo.forgetConsentGiven(),
            tags: [{
              tagName: 'div',
              attributes: { 'className': 'test' }
            }]
          }]
        },
        {
          isAllowedPredicate: () => this.isGoogleAddsAllowed,
          scripts: [
            {
              src: this.tagManagerScriptSource,
              scripts: [{
                src: this.gtagScriptSource,
                removeQueries: [
                  'body script[src*=googleadservices]',
                  'body iframe[src*=doubleclick]'
                ]
              }]
            }
          ]
        },
        {
          isAllowedPredicate: () => this.isLinkedInAllowed,
          scripts: [
            {
              src: this.linkedInScriptSource,
              tags: [{
                tagName: 'img',
                attributes: {
                  src: this.linkedInNoScriptSource,
                  alt: 'None',
                  width: '1',
                  height: '1'
                },
                style: { display: 'none' },
                removeQueries: ['body script[src^="https://snap.licdn.com"]']
              }]
            }
          ]
        }
      ],
      events: [accepted, closed, rejected]
    })
  }

  ngAfterViewInit(): void {
    AOS.refresh();
  }

  title = 'demo';

  test() {
    this.nav.visit.start();
  }
}
