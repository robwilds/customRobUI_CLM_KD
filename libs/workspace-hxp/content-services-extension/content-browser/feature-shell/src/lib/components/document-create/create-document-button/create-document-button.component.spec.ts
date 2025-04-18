/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { MatButtonModule } from '@angular/material/button';
import { HxPCreateDocumentButtonComponent } from './create-document-button.component';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MockComponents, MockProvider } from 'ng-mocks';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { MatDividerModule } from '@angular/material/divider';
import { ContentUploadDialogComponent } from '../upload/upload-dialog/upload-dialog.component';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UploadFileButtonComponent } from '../upload/upload-button/upload-button.component';

describe('HxPCreateDocumentButtonComponent', () => {
    let component: HxPCreateDocumentButtonComponent;
    let fixture: ComponentFixture<HxPCreateDocumentButtonComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HxPCreateDocumentButtonComponent, MockComponents(UploadFileButtonComponent, ContentUploadDialogComponent)],
            imports: [
                CommonModule,
                MatButtonModule,
                MatDialogModule,
                MatDividerModule,
                MatIconModule,
                MatMenuModule,
                NoopTranslateModule,
                RouterTestingModule,
                HttpClientTestingModule,
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: ActivatedRoute, useValue: { url: of([{ path: mocks.folderDocument.sys_path }]) } },
                MockProvider(HxpUploadService),
            ],
        });

        fixture = TestBed.createComponent(HxPCreateDocumentButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should not be in DOM when document doesn't have `CreateChild` permission", () => {
        component.document = {
            ...mocks.folderDocument,
            sys_effectivePermissions: [],
        };
        component.ngOnChanges();
        fixture.detectChanges();

        const createButton = fixture.debugElement.query(By.css('button.hxp-create-document-menu-button'));

        expect(createButton).toBeFalsy();
    });

    it('should be in DOM when document has `CreateChild` permission', () => {
        component.document = {
            ...mocks.folderDocument,
            sys_effectivePermissions: [DocumentPermissions.CREATE_CHILD],
        };
        component.ngOnChanges();
        fixture.detectChanges();

        const createButton = fixture.debugElement.query(By.css('button.hxp-create-document-menu-button'));

        expect(createButton).toBeTruthy();
    });
});
