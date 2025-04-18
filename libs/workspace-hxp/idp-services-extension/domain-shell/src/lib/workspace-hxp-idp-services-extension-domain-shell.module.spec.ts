/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { WorkspaceHxpIdpServicesDomainShellModule } from './workspace-hxp-idp-services-extension-domain-shell.module';
import { ExtensionService } from '@alfresco/adf-extensions';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NoopAuthModule, NoopTranslateModule } from '@alfresco/adf-core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('WorkspaceHxpIdpServicesDomainShellModule', () => {
    beforeEach(() => {
        const mockExtensionService = {
            setup$: of(),
        };

        TestBed.configureTestingModule({
            imports: [
                WorkspaceHxpIdpServicesDomainShellModule,
                StoreModule.forRoot(),
                EffectsModule.forRoot(),
                HttpClientTestingModule,
                NoopTranslateModule,
                NoopAuthModule,
                MatSnackBarModule,
            ],
            providers: [{ provide: ExtensionService, useValue: mockExtensionService }],
        });
    });

    it('initializes', () => {
        const module = TestBed.inject(WorkspaceHxpIdpServicesDomainShellModule);
        expect(module).toBeTruthy();
    });
});
