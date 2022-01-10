export const BITERGO_COMMON_CONFIGURATION = 'BITERGO_COMMON_CONFIGURATION';

export type PossibleIndex = string | number | undefined;

export const head = 'head' as const;
export const body = 'body' as const;
export const defaultTags = { head, body };

export interface HtmlAppendOptions {
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

export const scriptElement = 'script';
