/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DocumentActionToolbarComponent } from './document-action-toolbar.component';
import { DocumentMoreMenuItemsFactoryService } from '@alfresco/adf-hx-content-services/services';
import { ContentActionRef, ExtensionService } from '@alfresco/adf-extensions';
import { of } from 'rxjs';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { HttpClientModule } from '@angular/common/http';
import { NoopTranslateModule, ToolbarComponent } from '@alfresco/adf-core';
import { MockComponent, Type } from 'ng-mocks';
import { SelectedItemCountComponent } from '../selected-item-count/selected-item-count.component';
import { Component, Input } from '@angular/core';
import { ManageColumnButtonComponent } from '@alfresco/adf-hx-content-services/ui';
import { FeaturesServiceToken } from '@alfresco/adf-core/feature-flags';

interface MockedComponentBase {
    [key: string]: any;
}

function createMockedComponent(selector: string, inputs: string[] = []): Type<MockedComponentBase> {
    @Component({
        selector,
        template: '<div></div>',
    })
    class MockedComponent {
        constructor() {
            inputs.forEach((input) => {
                this[input] = null;
            });
        }
    }
    inputs.forEach((input) => {
        Object.defineProperty(MockedComponent.prototype, input, {
            configurable: true,
            enumerable: true,
            writable: true,
        });
        Input()(MockedComponent.prototype, input);
    });
    return MockedComponent;
}

// Use the factory to create mock components with dynamic inputs
const MockContentPropertiesViewerButtonComponent = createMockedComponent('hxp-content-properties-viewer-button', ['actionContext']);
const MockContentDeleteComponent = createMockedComponent('hxp-content-delete', ['actionContext']);
const MockSingleItemDownloadButtonComponent = createMockedComponent('hxp-single-item-download', ['actionContext']);
const MockContentShareButtonComponent = createMockedComponent('hxp-single-file-share', ['actionContext']);
const MockDocumentMoreActionComponent = createMockedComponent('hxp-document-more-action', ['actionContext', 'menuItems']);

const DOCUMENT_MORE_ACTION_REF = {
    id: 'app.document.more',
    type: 'menu',
    order: 10000,
    icon: 'more_vert',
    title: 'APP.ACTIONS.MORE',
    children: [
        {
            id: 'document.move',
            order: 200,
            type: 'custom',
            component: 'document.move',
            rules: {
                visible: 'app.canShowMove',
            },
        },
        {
            id: 'document.copy',
            order: 200,
            type: 'custom',
            component: 'document.copy',
        },
        {
            id: 'document.permissions_management',
            order: 200,
            type: 'custom',
            component: 'document.permissions_management',
        },
    ],
};

const EXTENSION_CONFIG = {
    $schema: '../../../extension.schema.json',
    $id: 'app.core',
    $name: 'app.core',
    $version: '0.0.1',
    $vendor: 'Alfresco Software, Ltd.',
    $license: 'LGPL-3.0',
    $runtime: '1.7.0',
    $description: 'Core application extensions and features',
    $references: [],
    $ignoreReferenceList: [],
    features: {
        header: [
            {
                id: 'app.header.more',
                type: 'menu',
                order: 10000,
                icon: 'more_vert',
                title: 'APP.ACTIONS.MORE',
                children: [
                    {
                        id: 'app.logout',
                        order: 200,
                        type: 'custom',
                        component: 'app.logout',
                        rules: {
                            visible: 'app.canShowLogout',
                        },
                    },
                ],
            },
        ],
        document: [DOCUMENT_MORE_ACTION_REF],
    },
};

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

describe('DocumentActionToolbarComponent', () => {
    let component: DocumentActionToolbarComponent;
    let fixture: ComponentFixture<DocumentActionToolbarComponent>;
    let documentMoreMenuItemsFactoryService: DocumentMoreMenuItemsFactoryService;
    let extensionService: ExtensionService;

    beforeEach(() => {
        const extensionServiceSpy = jasmine.createSpyObj('ExtensionService', ['setup$']);

        TestBed.configureTestingModule({
            imports: [HttpClientModule, NoopTranslateModule, ToolbarComponent, MockComponent(ManageColumnButtonComponent)],
            declarations: [
                DocumentActionToolbarComponent,
                MockComponent(SelectedItemCountComponent),
                MockContentPropertiesViewerButtonComponent,
                MockContentDeleteComponent,
                MockSingleItemDownloadButtonComponent,
                MockContentShareButtonComponent,
                MockDocumentMoreActionComponent,
            ],
            providers: [
                { provide: ExtensionService, userValue: extensionServiceSpy },
                DocumentMoreMenuItemsFactoryService,
                { provide: FeaturesServiceToken, useValue: { isOn$: () => of(true) } },
            ],
        });

        documentMoreMenuItemsFactoryService = TestBed.inject(DocumentMoreMenuItemsFactoryService);
        extensionService = TestBed.inject(ExtensionService);
        extensionService.setup$ = of(EXTENSION_CONFIG);
        fixture = TestBed.createComponent(DocumentActionToolbarComponent);
        component = fixture.componentInstance;
        component.actionContext = { documents: [] };
        component.selection = [];
    });

    it('should load more menu properly', (done) => {
        expect(component).toBeTruthy();
        documentMoreMenuItemsFactoryService.getMoreMenuItems().subscribe({
            next: (actionRef: ContentActionRef) => {
                expect(actionRef.type).toEqual('menu');
                expect(actionRef.children?.length).toBeGreaterThan(0);
                const moveMenuRef = actionRef.children?.find((ref) => (ref.id = 'document.move'));
                const copyMenuRef = actionRef.children?.find((ref) => (ref.id = 'document.copy'));
                const permissionMenuRef = actionRef.children?.find((ref) => (ref.id = 'document.permissions_management'));
                expect(moveMenuRef).toBeDefined();
                expect(copyMenuRef).toBeDefined();
                expect(permissionMenuRef).toBeDefined();
                done();
            },
        });
    });

    it('should update action context OnChanges event', () => {
        component.selection = [mocks.fileDocument];
        component.ngOnChanges();
        fixture.detectChanges();

        expect(component.actionContext?.documents).toHaveSize(1);
    });

    it('should pass accessibility checks', waitForAsync(async () => {
        component.selection = [mocks.fileDocument];
        component.ngOnChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const res = await a11yReport('adf-toolbar');

        expect(res.violations).toEqual(EXPECTED_VIOLATIONS);
    }));
});
