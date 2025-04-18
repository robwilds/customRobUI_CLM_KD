/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { AuthModule, CoreModule, provideTranslations } from '@alfresco/adf-core';
import { AppComponent } from './app.component';
import { AppExtensionsModule, ExperienceWorkspaceAppShellModule } from '@hxp/workspace-hxp/app-shell';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { SHARED_IDENTITY_FULL_NAME_PIPE_INCLUDE_EMAIL } from '@alfresco-dbp/shared/identity';
import { provideCustomAuthStoragePrefix } from '@alfresco-dbp/shared-authentication-services';
import { CustomAlfrescoApiFactory } from './services/alfresco-api-factory';
import { PluginsModule } from '@plugins';
import { ALFRESCO_API_FACTORY, AlfrescoApiLoaderService, createAlfrescoApiInstance } from '@alfresco/adf-content-services';
import { APP_IDENTIFIER, AppIdentifiers } from '@alfresco-dbp/shared-core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PublicAccessShellModule } from '@hxp/workspace-hxp/public-access-extension/domain-shell';

import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localeJa from '@angular/common/locales/ja';
import localeNl from '@angular/common/locales/nl';
import localePt from '@angular/common/locales/pt';
import localeNb from '@angular/common/locales/nb';
import localeRu from '@angular/common/locales/ru';
import localeCh from '@angular/common/locales/zh';
import localeAr from '@angular/common/locales/ar';
import localeCs from '@angular/common/locales/cs';
import localePl from '@angular/common/locales/pl';
import localeFi from '@angular/common/locales/fi';
import localeDa from '@angular/common/locales/da';
import localeSv from '@angular/common/locales/sv';

registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeIt);
registerLocaleData(localeEs);
registerLocaleData(localeJa);
registerLocaleData(localeNl);
registerLocaleData(localePt);
registerLocaleData(localeNb);
registerLocaleData(localeRu);
registerLocaleData(localeCh);
registerLocaleData(localeAr);
registerLocaleData(localeCs);
registerLocaleData(localePl);
registerLocaleData(localeFi);
registerLocaleData(localeDa);
registerLocaleData(localeSv);

@NgModule({
    declarations: [AppComponent],
    imports: [
        PluginsModule,
        BrowserModule,
        CommonModule,
        BrowserAnimationsModule,
        HttpClientModule,
        TranslateModule.forRoot(),
        CoreModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot(),
        RouterModule.forRoot([], {
            useHash: true,
        }),
        AppExtensionsModule.forRoot(),
        ExperienceWorkspaceAppShellModule,
        environment.production ? [] : StoreDevtoolsModule.instrument({ maxAge: 25 }),
        FeatureFlagsModule,
        PublicAccessShellModule,
        AuthModule.forRoot({ useHash: true }),
    ],
    providers: [
        {
            provide: ALFRESCO_API_FACTORY,
            useClass: CustomAlfrescoApiFactory,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: createAlfrescoApiInstance,
            deps: [AlfrescoApiLoaderService],
            multi: true,
        },
        provideTranslations('app', 'resources'),
        provideTranslations('idp-services-extension-domain-shell', 'assets/idp-services-extension-domain-shell'),
        provideTranslations('idp-viewer', 'assets/idp-viewer'),
        provideTranslations('upload-files', 'assets/upload-files'),
        provideTranslations('adf-hx-content-services-search-icons', 'assets/adf-enterprise-adf-hx-content-services-icons'),
        provideTranslations('content-services-extension-shared-content-repository-ui', 'assets/content-services-extension-shared-content-repository'),
        provideTranslations('content-services-extension-search-feature-shell', 'assets/content-services-extension-search'),
        provideTranslations('shared-filters-smart', `resources/shared/filters/smart`),
        provideTranslations('idp-services-extension-class-verification', 'assets/idp-services-extension-class-verification'),
        provideTranslations('idp-services-extension-field-verification', 'assets/idp-services-extension-field-verification'),
        provideTranslations('idp-services-extension-shared', 'assets/idp-services-extension-shared'),
        provideTranslations('public-access-extension-forms', 'assets/public-access-extension/public-forms'),
        {
            provide: SHARED_IDENTITY_FULL_NAME_PIPE_INCLUDE_EMAIL,
            useValue: true,
        },
        { provide: APP_IDENTIFIER, useValue: AppIdentifiers.HxPWorkspace },
        ...provideCustomAuthStoragePrefix(),
    ],
    exports: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
