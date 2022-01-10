import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { PossibleIndex } from '../shared';

import { ProviderNextOptions, ProviderRemoveOptions, ProviderServiceOptions } from '../shared/provider.types';
import { ActionOptions, ScriptOptions, TagOptions } from '../shared/provider.types';
import { HTMLTagService } from './html-tag.service';

import { defaultTags, scriptElement } from '../shared';
const { body } = defaultTags;

// please add logging

@Injectable()
export class ProviderService {
  private readonly idsMap: Record<string, number | undefined> = {};
  private isEnabledLogging = false;

  constructor(
    private htmlTag: HTMLTagService,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  update({ providers, events = [], isEnabledLogging = false }: ProviderServiceOptions) {
    this.isEnabledLogging = isEnabledLogging;

    this.logSeparator();

    providers.forEach(({
      isAllowedPredicate,
      actions = [],
      scripts = [],
      tags = []
    }, globalIndex) => {
      this.remove({ index: globalIndex.toString(), next: { scripts, actions, tags } });
      if (isAllowedPredicate()) {
        scripts.forEach((script, index) => this.addScript(script, this.joinIndexes(globalIndex, index)));
        tags.forEach((tag, index) => this.addTag(tag, this.joinIndexes(globalIndex, index)));
        actions.forEach((action, index) => this.allowAction(action, this.joinIndexes(globalIndex, index)));
      }
    });

    events.forEach(event => event.subscribe(() => this.update({ providers, isEnabledLogging })));
  }

  private addScript({ parentQuery = body, src, scripts, tags, actions }: ScriptOptions, index: string) {
    const element = scriptElement;
    const attributes = { src };

    if (!this.document.querySelector(`${parentQuery} ${element}[src="${src}"]`)) {
      this.htmlTag
        .appendAndLoad({ element, attributes, parentQuery })
        .then(resultId => {
          const newScriptMapId = this.joinIndexes(element, index);
          this.idsMap[newScriptMapId] = resultId;

          this.log('Script added:', newScriptMapId, src);

          this.next({ scripts, tags, actions }, index);
        });
    }
  }

  private addTag({ parentQuery = body, style, tagName, attributes, scripts, tags, actions }: TagOptions, index: string) {
    const element = tagName;
    const newTagMapId = this.joinIndexes(tagName, index);
    this.idsMap[newTagMapId] = this.htmlTag.append({ element, attributes, style, parentQuery });

    this.log('Tag added:', newTagMapId);

    this.next({ scripts, tags, actions }, index);
  }

  private allowAction({ onAllow, actions, scripts, tags }: ActionOptions, index: string) {
    onAllow();

    this.log('Allow action executed:', onAllow.toString());

    this.next({ actions, scripts, tags }, index);
  }

  private next({ actions, scripts, tags }: Partial<ProviderNextOptions>, index: string) {
    scripts?.forEach((script, nestedIndex) =>
      this.addScript(script, this.joinIndexes(index, nestedIndex)));

    tags?.forEach((tag, nestedIndex) =>
      this.addTag(tag, this.joinIndexes(index, nestedIndex)));

    actions?.forEach((action, nestedIndex) =>
      this.allowAction(action, this.joinIndexes(index, nestedIndex)));
  }

  private joinIndexes(index: PossibleIndex, nestedIndex: PossibleIndex) {
    return [index, nestedIndex].filter(item => item !== undefined).join('_');
  }

  private remove({ index, removeAction, element, next }: ProviderRemoveOptions) {
    const { scripts = [], tags = [], actions = [], removeQueries = [] } = next;

    if (element && index) {
      const removedElementMapId = this.joinIndexes(element, index);
      this.htmlTag.remove(this.idsMap[removedElementMapId]);
      delete this.idsMap[removedElementMapId];
      this.log('Tag or script removed:', removedElementMapId);
    }

    if (removeAction) {
      removeAction();
      this.log('Disallow action executed:', removeAction.toString());
    }

    removeQueries.forEach(query => this.removeTagsByQuery(query));

    const removeItems: ProviderRemoveOptions[] = ([
      ...scripts.map((next, nestedIndex) =>
        ({
          index: this.joinIndexes(index, nestedIndex), next, element: scriptElement
        })),
      ...tags.map((next, nestedIndex) =>
        ({
          index: this.joinIndexes(index, nestedIndex), next, element: next.tagName
        })),
      ...actions.map((next, nestedIndex) =>
        ({
          index: this.joinIndexes(index, nestedIndex), next, removeAction: next.onDisallow
        }))
    ]);

    removeItems.forEach(item => this.remove(item));
  }

  private removeTagsByQuery(query: string) {
    const all = Array.from(this.document.querySelectorAll(query));

    if (all.length) {
      this.log('Removed tags with query:', all.map(item => item.outerHTML).join('\n'));
    }

    all.forEach(tag => tag.remove());
  }

  private log(...data: any[]) {
    if (this.isEnabledLogging) {
      console.log(data.join('\n'));
    }
  }

  private logSeparator() {
    this.log('\n===============================================\n');
  }
}
