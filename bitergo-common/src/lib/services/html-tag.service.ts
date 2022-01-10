import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HtmlAppendOptions, defaultTags } from '../shared';

const { head } = defaultTags;

@Injectable()
export class HTMLTagService {
  parents: Record<number, HTMLElement> = {};
  appended: Record<number, HTMLElement> = {};
  isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(DOCUMENT) private document: Document
  ) { }

  private getUniqueID() {
    let result = +new Date();
    while (this.appended[result] || this.parents[result]) {
      result++;
    }
    return result;
  }

  append({ attributes = {}, parentQuery = head, element, allowInSSR, style }: HtmlAppendOptions): number | undefined {
    if (this.isBrowser || allowInSSR) {
      const id = this.getUniqueID();
      this.appended[id] = this.document.createElement(element);

      Object
        .keys(attributes)
        .forEach(name =>
          (this.appended[id] as any)[name] = attributes[name]);

      if (style) {
        this.appended[id]
          .setAttribute('style',
            Object.keys(style)
              .map(key => `${key}: ${(style as any)[key]}`)
              .join(';'));
      }

      const parent = this.document.querySelector(parentQuery) as HTMLElement;

      if (parent) {
        this.parents[id] = parent;
        this.parents[id].appendChild(this.appended[id]);

        return id;
      } else {
        this.appended[id].remove();
        delete this.appended[id];
      }
    }

    return undefined;
  }

  /**
   * Create html tag with attribute and append it to parent with params
   * @param ${HtmlAppendOptions} param0 - parentQuery default value is head
   * parentQuery - default value is head
   */
  appendAndLoad(options: HtmlAppendOptions): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      const id = this.append(options);

      if (id) {
        this.appended[id].onload = () => {
          resolve(id);
        };

        this.appended[id].onerror = () => {
          reject(undefined);
        };
      } else {
        reject(undefined);
      }
    });
  }

  remove(id?: number): void {
    if (this.isBrowser && id) {
      this.parents[id]?.removeChild(this.appended[id]);
      delete this.parents[id];
      delete this.appended[id];
    }
  }
}
