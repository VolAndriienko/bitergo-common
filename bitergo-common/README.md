## Bitergo Common
Purpose of this package is to help to develop Bitergo webapps and reduce code duplication.

## Installation
In order to install the **`bitergo-common`** can be used next command:
```
npm i bitergo-common
```

After that, **`BitergoCommonModule`** need to be imported to module, using `forRoot` static method:
```
import { NgModule } from '@angular/core';
...
import { BitergoCommonModule } from 'bitergo-common';

@NgModule({
  declarations: [...],
  imports: [
    ...,
    BitergoCommonModule.forRoot()
  ],
  providers: [..],
  bootstrap: [...]
})
export class AppModule { }

```

**`BitergoCommonModule`** `forRoot` static method has no any configuration input, for now.

## Overview

The **`bitergo-common`** library includes 2 services and 1 pipe:
- **`HTMLTagService`**

Allows to append html tag/scripts with tiny amount of efforts in declarative 


- **`ProviderService`**

Allows to append or remove html tag/scripts or run the actions, depends on boolean indicator, in concrete order with waiting until scripts will be loaded.

- **`SafePipe`**

Allows to use [`DomSanitizer`](https://angular.io/api/platform-browser/DomSanitizer) in html template with specifying type of resource.


## **`HTMLTagService`**

The service provides quick interface to append and remove html tags or scripts, with possibility to wait until they will be loaded.

Using service, can be called next public methods:
- `append(input: HtmlAppendOptions): number | undefined`
- `appendAndLoad(options: HtmlAppendOptions): Promise<number | undefined>`
- `remove(id?: number): void`

Methods `append` and `appendAndLoad` are doing almost the same, but second one is waiting until loading is finished and returns `Promise`.

Both appends html tag, and in case of success they return number - id of created `HtmlElement` inside the service.

>Result **`id`** of `append` and `appendAndLoad` methods is **NOT** the same as `id` attribute of the `HtmlElement`.

Result **`id`** can be used ONLY for removing html element from DOM, using `remove` method.

As the input for the append methods, can be used `HtmlAppendOptions` interface:
```
interface HtmlAppendOptions {
  // name of tag to append
  element: keyof HTMLElementTagNameMap;
  // query to parent container, that will be used to append HTML tag
  // default: 'head'
  parentQuery?: string | typeof head | typeof body;
  // any HTML tag attributes, like className, src, or whatever
  attributes?: Record<string, string>;
  // whether need to append tag on server side too.
  allowInSSR?: boolean;
  // the same as 'style' attribute of the 'HTMLElement'
  style?: Partial<CSSStyleDeclaration>;
}
```

## **`ProviderService`**

This service is using **`HTMLTagService`** to append/remove script/tag or run some action.

It can be done by some condition, in chainable way, with possibility to rebuild everything on some events.

It provides only one public method **`update`** with input of interface `ProviderServiceOptions`.

Service is suitable to use when exists next conditions:
- there is a need to append some scripts, sequentially and wait when every script is loaded;
- need to remove scripts from DOM when some condition is changed;
- need to run some action on different conditions changed;
- need to append/remove html tags depends on events or conditions;

The idea behind the service is next:
- input contains `providers` and `events` properties;
- `events` are rxjs Subject objects;
- `providers` are the set of `actions` (means any function), `scripts` or `tags` (further **`provider item`**);
- actions consists from `onAllow` and 'onDisallow' function;
- each `provider item` can have others sets of provider items (`actions', `scripts` or `tags`);
- generally it can be created tree with provider items;
- every `provider item` has **`isAllowedPredicate`** input function to determine current state;
- when `update` function executes and:

 -**`isAllowedPredicate`** returns `true` (**build process**) - `scripts or tags` will be added to DOM, `actions` will call `onAllow` function;
 
 -**`isAllowedPredicate`** returns `false` (**destroy process**) - `scripts or tags` will be removed from DOM, `actions` will call `onDisallow` function;
 
- before every **build process** will be executed **destroy process**;
- **`update`** will be executed (and **destroy and build** or **destroy** processes) everytime when event from **`events`** is fired;
- initially **`update`** will be executed once, no matter was any event fired or not;

### Example

```
import { Component } from '@angular/core';
import { ProviderService } from 'bitergo-common';
import { CookieStatusNotificationService } from 'langs-cookie-consent';
import { providers } from './langs-cookie-consent.configuration';
import { MatomoTracker } from 'ngx-matomo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  tagManagerScriptSource = 'https://www.googletagmanager.com/gtag/js?id=AW-11111111111';
  gtagScriptSource = '/assets/scripts/gtag.js';

  linkedInScriptSource = '/assets/scripts/linkedin.js';
  linkedInNoScriptSource = 'https://px.ads.linkedin.com/collect/?pid=11111111111&fmt=gif';

  get isMatomoAllowed() {
    return this.cookieStatus.isProviderAllowed(providers.matomo);
  }

  get isGoogleAddsAllowed() {
    return this.cookieStatus.isProviderAllowed(providers.google_ads);
  };

  get isLinkedInAllowed() {
    return this.cookieStatus.isProviderAllowed(providers.linked_in);
  }

  constructor(
    private matomo: MatomoTracker,
    private providerService: ProviderService,
    private cookieStatus: CookieStatusNotificationService,
  ) {
    const { accepted, closed, rejected } = this.cookieStatus;

    this.providerService.update({
      isEnabledLogging: true,
      providers: [
        // first provider
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
        // second provider
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
        // third provider
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
}

```

### Example explanation

In example above we want to keep the state of scripts according with Cookie Consent banner.

In the banner we have three sliders: Matomo, Google Ads and Linked.

Depends on slider state - provider scripts/actions/tags should be added or removed.
We want also update that state when Cookie Consent banner is accepted, closed or rejected.
***
In **first** scenario, if Matomo slider is toggled on (`isMatomoAllowed` getter):

1. `onAllow: () => this.matomo.rememberConsentGiven()` will be exectuted;
2. Then `div` tag with `class` `test` will be added;
***
In **second** scenario, if Google Adds slider is toggled on (`isGoogleAddsAllowed` getter):
1. Will be loaded script `tagManagerScriptSource`;
2. Then will be loaded `gtagScriptSource` script;

If Google Adds slider is toggled off - after removing `gtagScriptSource` script - will be removed all tags that matched queries:
```
removeQueries: [
  'body script[src*=googleadservices]',
  'body iframe[src*=doubleclick]'
]
```
***
The only one difference in the **third** scenario: after script is loaded - will be loaded tag `image` with attrbites and styles.
***
Count of nested **`provider items`** or amount of them is not limited.

## Interfaces
```
import { Subject } from 'rxjs';

export interface ProviderNextOptions {
  scripts: ScriptOptions[];
  tags: TagOptions[];
  actions: ActionOptions[];
}

export interface ProviderRemoveTagOptions {
  removeQueries: string[];
}

export interface ProviderCommonTagOptions {
  parentQuery: string;
}

export interface ScriptOptions extends
  Partial<ProviderNextOptions>,
  Partial<ProviderRemoveTagOptions>,
  Partial<ProviderCommonTagOptions> {
  src: string;
}

export interface TagOptions extends
  Partial<ProviderNextOptions>,
  Partial<ProviderRemoveTagOptions>,
  Partial<ProviderCommonTagOptions> {
  tagName: keyof HTMLElementTagNameMap;
  attributes?: Record<string, string>;
  style?: Partial<CSSStyleDeclaration>;
}

export interface ActionOptions extends Partial<ProviderNextOptions> {
  onAllow: () => void;
  onDisallow: () => void;
}

export interface ProviderOptions extends Partial<ProviderNextOptions> {
  isAllowedPredicate: () => boolean;
}

export interface ProviderServiceOptions {
  providers: ProviderOptions[];
  events?: Subject<any>[];
  isEnabledLogging?: boolean;
}

export interface ProviderRemoveOptions {
  index?: string;
  element?: string;
  removeAction?: () => void;
  next: Partial<ProviderNextOptions> & Partial<ProviderRemoveTagOptions>;
}
```
