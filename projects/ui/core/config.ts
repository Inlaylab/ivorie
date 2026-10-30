import {
  EnvironmentProviders,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
  makeEnvironmentProviders,
} from '@angular/core'

/** App-wide defaults for Ivorie components. */
export interface IvorieConfig {
  /** Tooltip open delay in ms. Default 0. */
  tooltipDelay?: number
  /**
   * Whether the sidebar starts in mobile mode, before the viewport is known (server render and
   * hydration). Set it from a user-agent hint to avoid a layout switch on phones. Default false.
   */
  sidebarMobile?: boolean
}

export const IV_CONFIG = new InjectionToken<IvorieConfig>('IV_CONFIG', {
  providedIn: 'root',
  factory: () => ({}),
})

/** Sets Ivorie defaults. Use in `bootstrapApplication` providers. */
export function provideIvorie(config: IvorieConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: IV_CONFIG, useValue: config }])
}

/** NgModule form of {@link provideIvorie} for module-based apps. */
@NgModule()
export class IvorieModule {
  static forRoot(config: IvorieConfig = {}): ModuleWithProviders<IvorieModule> {
    return { ngModule: IvorieModule, providers: [provideIvorie(config)] }
  }
}
