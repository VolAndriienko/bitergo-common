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