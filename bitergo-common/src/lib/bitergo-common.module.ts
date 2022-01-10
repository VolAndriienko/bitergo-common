import { NgModule, ModuleWithProviders, Injector } from '@angular/core';
import { SafePipe } from './pipes/safe.pipe';
import { HTMLTagService } from './services/html-tag.service';
import { ProviderService } from './services/provider.service';
import { BITERGO_COMMON_CONFIGURATION } from './shared';

@NgModule({
  declarations: [
    SafePipe,
  ],
  providers: [
    SafePipe,
    HTMLTagService,
    ProviderService
  ],
  exports: [
    SafePipe
  ],
})
export class BitergoCommonModule {
  constructor(
    private injector: Injector
  ) {
    this.injector.get(HTMLTagService);
    this.injector.get(ProviderService);
  }

  static forRoot(): ModuleWithProviders<BitergoCommonModule> {
    return {
      ngModule: BitergoCommonModule,
      providers: [
        {
          provide: BITERGO_COMMON_CONFIGURATION,
          useValue: {}
        },
        SafePipe,
        HTMLTagService,
        ProviderService
      ],
    };
  }

  static forChild(): ModuleWithProviders<BitergoCommonModule> {
    return {
      ngModule: BitergoCommonModule,
      providers: [
        {
          provide: BITERGO_COMMON_CONFIGURATION,
          useValue: {}
        },
        SafePipe,
        HTMLTagService,
        ProviderService
      ],
    };
  }
}
