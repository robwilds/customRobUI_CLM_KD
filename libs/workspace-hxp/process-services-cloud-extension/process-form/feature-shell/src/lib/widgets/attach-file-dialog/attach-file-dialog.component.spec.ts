/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DataColumnComponent, DataColumnListComponent, DownloadService, EmptyListComponent, NoopTranslateModule } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { AttachFileDialogComponent, CONTENT_REPOSITORY_DEFAULT_PATH } from './attach-file-dialog.component';
import { AttachFileDialogData, SelectionMode } from '@hxp/shared-hxp/form-widgets/feature-shell';
import { DocumentFetchResults, DocumentService, HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MockComponents, MockProvider, MockService } from 'ng-mocks';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatTabHarness } from '@angular/material/tabs/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    HxpUploadDragAreaComponent,
    HxpUploadService,
    HxpUploadingDialogComponent,
    UploadHxpButtonComponent,
} from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { HxpDocumentListComponent } from '@alfresco/adf-hx-content-services/ui';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { FeaturesServiceToken, provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { STUDIO_HXP } from '@features';
import { MatIconModule } from '@angular/material/icon';
import { SharedDownloadService, SharedAttachFileDialogService } from '@hxp/shared-hxp/services';
import { AttachFileDialogService } from './services/attach-file-dialog.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const FILE_DOCUMENT_MOCK: Document = {
    sys_isFolderish: false,
    sys_primaryType: 'SysFile',
};

const FOLDER_DOCUMENT_MOCK: Document = {
    sys_isFolderish: true,
    sys_primaryType: 'SysFolder',
};

const CONTENT_REPOSITORY_DEFAULT_FOLDER_MOCK: Document = {
    sys_isFolderish: true,
    sys_primaryType: 'SysFolder',
    sys_path: CONTENT_REPOSITORY_DEFAULT_PATH,
};

const FOLDER_DOCUMENT_COLLECTION_MOCK: DocumentFetchResults = {
    documents: [...mocks.nestedDocumentAncestors].reverse(),
    limit: 10,
    offset: 0,
    totalCount: 2,
};

describe('AttachFileDialogComponent', () => {
    let component: AttachFileDialogComponent;
    let fixture: ComponentFixture<AttachFileDialogComponent>;
    let loader: HarnessLoader;

    let documentService: DocumentService;
    let getDocumentByPathSpy: jasmine.Spy;
    let getAllChildrenSpy: jasmine.Spy;

    let notificationService: HxpNotificationService;
    let showErrorSpy: jasmine.Spy;

    const uploadService: HxpUploadService = MockService(HxpUploadService);

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
        open: jasmine.createSpy('open'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                MatDialogModule,
                MatButtonModule,
                MatTabsModule,
                MatSnackBarModule,
                NoopAnimationsModule,
                MatProgressSpinnerModule,
                NoopTranslateModule,
                MatIconModule,
            ],
            declarations: [
                AttachFileDialogComponent,
                ...MockComponents(
                    HxpUploadDragAreaComponent,
                    HxpUploadingDialogComponent,
                    HxpDocumentListComponent,
                    EmptyListComponent,
                    UploadHxpButtonComponent,
                    DataColumnListComponent,
                    DataColumnComponent
                ),
            ],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                MockProvider(MAT_DIALOG_DATA),
                MockProvider(DocumentService),
                {
                    provide: SharedDownloadService,
                    useClass: DownloadService,
                },
                {
                    provide: SharedAttachFileDialogService,
                    useClass: AttachFileDialogService,
                },
                MockProvider(HxpUploadService, uploadService),
                provideMockFeatureFlags({
                    [STUDIO_HXP.ATTACH_FILE_WIDGET_DEFAULT_FOLDER]: false,
                }),
            ],
        });

        uploadService.fileUploadComplete = new Subject<any>();
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('post upload', () => {
        const mockDialogData: AttachFileDialogData = {
            selectionMode: SelectionMode.single,
            selectionSubject$: new Subject<Document[]>(),
            isLocalUploadAvailable: true,
            isContentUploadAvailable: true,
            defaultDocumentPath$: of(undefined),
        };

        beforeEach(() => {
            TestBed.overrideProvider(MAT_DIALOG_DATA, {
                useValue: mockDialogData,
            });
            documentService = TestBed.inject(DocumentService);

            getAllChildrenSpy = spyOn(documentService, 'getAllChildren').and.returnValue(of(FOLDER_DOCUMENT_COLLECTION_MOCK));

            fixture = TestBed.createComponent(AttachFileDialogComponent);
            component = fixture.componentInstance;
            component.displayedDocument$ = of(FILE_DOCUMENT_MOCK);

            fixture.detectChanges();
        });

        it('should refresh document list after upload', async () => {
            component.documentNavigationStack = [{ sys_primaryType: 'mock', sys_path: '/some/path' }];
            getDocumentByPathSpy = spyOn(documentService, 'getDocumentByPath').and.returnValue(of(FOLDER_DOCUMENT_MOCK));
            fixture.detectChanges();
            const navigationStackBeforeRefresh = component.documentNavigationStack;

            uploadService.fileUploadComplete.next({} as any);

            expect(getDocumentByPathSpy).toHaveBeenCalledWith('/some/path');
            expect(component.documentNavigationStack.length).toBe(1);
            expect(component.documentNavigationStack).toBe(navigationStackBeforeRefresh);
        });

        it('should cleanup upload complete subscription after destruction', () => {
            component.ngOnDestroy();
            getDocumentByPathSpy = spyOn(documentService, 'getDocumentByPath').and.returnValue(of(FOLDER_DOCUMENT_MOCK));

            uploadService.fileUploadComplete.next({} as any);

            expect(getDocumentByPathSpy).not.toHaveBeenCalled();
        });

        it('should update documentCollection when navigateForward called', fakeAsync(() => {
            component.navigateForward(FOLDER_DOCUMENT_MOCK);
            fixture.detectChanges();

            let collection: Document[] = [];
            component.fetchDocumentCollection$.subscribe((col: Document[] | null) => {
                collection = col || [];
            });

            tick();

            expect(collection.length).toEqual(2);
            expect(collection[0].sys_title).toEqual('Nested Folder 1');
        }));
    });

    describe(`when local upload is not available and ${STUDIO_HXP.ATTACH_FILE_WIDGET_DEFAULT_FOLDER} flag is off`, () => {
        const mockDialogData: AttachFileDialogData = {
            selectionMode: SelectionMode.single,
            selectionSubject$: new Subject<Document[]>(),
            isLocalUploadAvailable: false,
            isContentUploadAvailable: true,
            defaultDocumentPath$: of(undefined),
        };

        beforeEach(() => {
            TestBed.overrideProvider(MAT_DIALOG_DATA, {
                useValue: mockDialogData,
            });
            documentService = TestBed.inject(DocumentService);
            notificationService = TestBed.inject(HxpNotificationService);

            getDocumentByPathSpy = spyOn(documentService, 'getDocumentByPath').and.returnValue(of(CONTENT_REPOSITORY_DEFAULT_FOLDER_MOCK));

            getAllChildrenSpy = spyOn(documentService, 'getAllChildren').and.returnValue(of(FOLDER_DOCUMENT_COLLECTION_MOCK));

            fixture = TestBed.createComponent(AttachFileDialogComponent);
            component = fixture.componentInstance;
            loader = TestbedHarnessEnvironment.loader(fixture);
        });

        it('should get data from MAT_DIALOG_DATA as an input to the dialog', async () => {
            fixture.detectChanges();
            expect(component.data).toEqual(mockDialogData);
            expect(await component.data['defaultDocumentPath$'].toPromise()).toEqual(CONTENT_REPOSITORY_DEFAULT_PATH);
            expect(component.data['selectionMode']).toEqual(SelectionMode.single);
            expect(component.data['selectionSubject$']).toEqual(jasmine.any(Subject));
            expect(component.data['isLocalUploadAvailable']).toEqual(false);
        });

        it('should open the dialog in CONTENT_REPOSITORY_DEFAULT_PATH', () => {
            fixture.detectChanges();
            expect(getDocumentByPathSpy).toHaveBeenCalledWith(CONTENT_REPOSITORY_DEFAULT_PATH);
            expect(component.documentNavigationStack).toEqual([CONTENT_REPOSITORY_DEFAULT_FOLDER_MOCK]);
        });
    });

    describe(`when local upload is not available and ${STUDIO_HXP.ATTACH_FILE_WIDGET_DEFAULT_FOLDER} flag is on`, () => {
        const testPath = '/test/path';
        const mockDialogData: AttachFileDialogData = {
            selectionMode: SelectionMode.single,
            selectionSubject$: new Subject<Document[]>(),
            isLocalUploadAvailable: false,
            isContentUploadAvailable: true,
            defaultDocumentPath$: of(testPath),
        };

        beforeEach(() => {
            TestBed.overrideProvider(MAT_DIALOG_DATA, {
                useValue: mockDialogData,
            });
            documentService = TestBed.inject(DocumentService);
            notificationService = TestBed.inject(HxpNotificationService);

            const featureService = TestBed.inject(FeaturesServiceToken);
            spyOn(featureService, 'isOn$').and.returnValue(of(true));

            getDocumentByPathSpy = spyOn(documentService, 'getDocumentByPath').and.returnValue(of(CONTENT_REPOSITORY_DEFAULT_FOLDER_MOCK));

            getAllChildrenSpy = spyOn(documentService, 'getAllChildren').and.returnValue(of(FOLDER_DOCUMENT_COLLECTION_MOCK));

            fixture = TestBed.createComponent(AttachFileDialogComponent);
            component = fixture.componentInstance;
            loader = TestbedHarnessEnvironment.loader(fixture);
        });

        it('should get data from MAT_DIALOG_DATA as an input to the dialog', async () => {
            fixture.detectChanges();
            expect(component.data).toEqual(mockDialogData);
            expect(await component.data['defaultDocumentPath$'].toPromise()).toEqual(testPath);
            expect(component.data['selectionMode']).toEqual(SelectionMode.single);
            expect(component.data['selectionSubject$']).toEqual(jasmine.any(Subject));
            expect(component.data['isLocalUploadAvailable']).toEqual(false);
        });

        it('should open the dialog in provided path', () => {
            fixture.detectChanges();
            expect(getDocumentByPathSpy).toHaveBeenCalledWith(testPath);
            expect(component.documentNavigationStack).toEqual([CONTENT_REPOSITORY_DEFAULT_FOLDER_MOCK]);
        });
    });

    describe('when local upload is available', () => {
        describe('and defaultDocumentPath is not specified', () => {
            const mockDialogData: AttachFileDialogData = {
                selectionMode: SelectionMode.single,
                selectionSubject$: new Subject<Document[]>(),
                isLocalUploadAvailable: true,
                isContentUploadAvailable: true,
                defaultDocumentPath$: of(undefined),
            };

            beforeEach(() => {
                TestBed.overrideProvider(MAT_DIALOG_DATA, {
                    useValue: mockDialogData,
                });
                notificationService = TestBed.inject(HxpNotificationService);

                showErrorSpy = spyOn(notificationService, 'showError').and.callThrough();

                fixture = TestBed.createComponent(AttachFileDialogComponent);
                component = fixture.componentInstance;
                loader = TestbedHarnessEnvironment.loader(fixture);
            });

            it('should get data from MAT_DIALOG_DATA as an input to the dialog', async () => {
                fixture.detectChanges();
                expect(component.data).toEqual(mockDialogData);
                expect(await component.data['defaultDocumentPath$'].toPromise()).toBeUndefined();
                expect(component.data['selectionMode']).toEqual(SelectionMode.single);
                expect(component.data['selectionSubject$']).toEqual(jasmine.any(Subject));
                expect(component.data['isLocalUploadAvailable']).toEqual(true);
            });

            it('should display error and close the dialog', () => {
                fixture.detectChanges();

                expect(showErrorSpy).toHaveBeenCalledWith('ATTACH_FILE_DIALOG.FOLDER_DOES_NOT_EXIST');
                expect(mockDialogRef.close).toHaveBeenCalled();
            });
        });

        describe('and defaultDocumentPath is specified', () => {
            const mockDialogData: AttachFileDialogData = {
                selectionMode: SelectionMode.single,
                selectionSubject$: new Subject<Document[]>(),
                isLocalUploadAvailable: true,
                isContentUploadAvailable: true,
                defaultDocumentPath$: of('/some/path'),
            };

            beforeEach(() => {
                TestBed.overrideProvider(MAT_DIALOG_DATA, {
                    useValue: mockDialogData,
                });
                documentService = TestBed.inject(DocumentService);
                notificationService = TestBed.inject(HxpNotificationService);

                getDocumentByPathSpy = spyOn(documentService, 'getDocumentByPath').and.returnValue(of(FOLDER_DOCUMENT_MOCK));
                showErrorSpy = spyOn(notificationService, 'showError').and.callThrough();
                getAllChildrenSpy = spyOn(documentService, 'getAllChildren').and.returnValue(of(FOLDER_DOCUMENT_COLLECTION_MOCK));

                fixture = TestBed.createComponent(AttachFileDialogComponent);
                component = fixture.componentInstance;
                loader = TestbedHarnessEnvironment.loader(fixture);
            });

            it('should get data from MAT_DIALOG_DATA as an input to the dialog', async () => {
                fixture.detectChanges();
                expect(component.data).toEqual(mockDialogData);
                expect(await component.data['defaultDocumentPath$'].toPromise()).toEqual('/some/path');
                expect(component.data['selectionMode']).toEqual(SelectionMode.single);
                expect(component.data['selectionSubject$']).toEqual(jasmine.any(Subject));
                expect(component.data['isLocalUploadAvailable']).toEqual(true);
            });

            it('should open the dialog in provided defaultDocumentPath if resolved', () => {
                fixture.detectChanges();
                expect(getDocumentByPathSpy).toHaveBeenCalledWith('/some/path');
                expect(getAllChildrenSpy).toHaveBeenCalled();
                expect(component.documentNavigationStack).toEqual([FOLDER_DOCUMENT_MOCK]);
            });

            it('should enable upload tab', async () => {
                fixture.detectChanges();

                const tabs = await loader.getAllHarnesses(MatTabHarness);
                expect(tabs.length).toBe(2);

                const uploadTab = tabs[1];
                expect(await uploadTab.getLabel()).toBe('ATTACH_FILE_DIALOG.TABS.LOCAL_STORAGE');
                expect(await uploadTab.isDisabled()).toBe(false);
            });

            it('should show the upload button when upload tab is selected', () => {
                fixture.detectChanges();

                let uploadButton = fixture.nativeElement.querySelector('hxp-upload-button');
                expect(uploadButton).toBeNull();

                component.selectedTabIndex = 1;
                fixture.detectChanges();

                uploadButton = fixture.nativeElement.querySelector('hxp-upload-button');
                expect(uploadButton).not.toBeNull();
            });

            it('should display error and close the dialog if path did not resolve', () => {
                getDocumentByPathSpy.and.returnValue(throwError('') as Observable<Document>);

                fixture.detectChanges();

                expect(getDocumentByPathSpy).toHaveBeenCalledWith('/some/path');
                expect(showErrorSpy).toHaveBeenCalledWith('ATTACH_FILE_DIALOG.FOLDER_NAME_DOES_NOT_EXIST', undefined, { folderName: 'path' });
                expect(mockDialogRef.close).toHaveBeenCalled();
            });

            it('should display error and close the dialog if content service is unavailable', () => {
                getDocumentByPathSpy.and.returnValue(throwError('code 503') as Observable<Document>);

                fixture.detectChanges();

                expect(getDocumentByPathSpy).toHaveBeenCalledWith('/some/path');
                expect(showErrorSpy).toHaveBeenCalledWith('ATTACH_FILE_DIALOG.CONTENT_SERVICE_UNAVAILABLE');
                expect(mockDialogRef.close).toHaveBeenCalled();
            });

            it('should display error inside dialog if user dont have access', () => {
                getDocumentByPathSpy.and.returnValue(throwError('code 403') as Observable<Document>);

                fixture.detectChanges();

                expect(getDocumentByPathSpy).toHaveBeenCalledWith('/some/path');
                expect(component.insideErrorMessage).toEqual('ATTACH_FILE_DIALOG.FOLDER_ACCESS_DENIED');
                expect(fixture.nativeElement.querySelector('.hxp-attach-file-dialog-error').textContent.trim()).toEqual(
                    'ATTACH_FILE_DIALOG.FOLDER_ACCESS_DENIED'
                );
            });
        });
    });

    describe('attach button', () => {
        const mockDialogData: AttachFileDialogData = {
            selectionMode: SelectionMode.single,
            selectionSubject$: new Subject<Document[]>(),
            isLocalUploadAvailable: false,
            isContentUploadAvailable: true,
            defaultDocumentPath$: of(undefined),
        };

        beforeEach(() => {
            TestBed.overrideProvider(MAT_DIALOG_DATA, {
                useValue: mockDialogData,
            });
            documentService = TestBed.inject(DocumentService);
            notificationService = TestBed.inject(HxpNotificationService);

            getDocumentByPathSpy = spyOn(documentService, 'getDocumentByPath').and.returnValue(of(FOLDER_DOCUMENT_MOCK));
            getAllChildrenSpy = spyOn(documentService, 'getAllChildren').and.returnValue(of(FOLDER_DOCUMENT_COLLECTION_MOCK));

            fixture = TestBed.createComponent(AttachFileDialogComponent);
            component = fixture.componentInstance;
            loader = TestbedHarnessEnvironment.loader(fixture);
        });

        it('should disable the attach button when no document is selected', async () => {
            const attachButton = await loader.getHarness(
                MatButtonHarness.with({
                    text: 'ATTACH_FILE_DIALOG.ACTIONS.ATTACH',
                })
            );
            expect(await attachButton.isDisabled()).toBe(true);
        });

        it('should enable the attach button when selection mode is single and only one document is selected', async () => {
            const attachButton = await loader.getHarness(
                MatButtonHarness.with({
                    text: 'ATTACH_FILE_DIALOG.ACTIONS.ATTACH',
                })
            );
            component.data.selectionMode = SelectionMode.single;

            component.chosenDocuments$.next([]);
            fixture.detectChanges();
            expect(await attachButton.isDisabled()).toBe(true);

            component.chosenDocuments$.next([FILE_DOCUMENT_MOCK]);
            fixture.detectChanges();
            expect(await attachButton.isDisabled()).toBe(false);

            component.chosenDocuments$.next([FILE_DOCUMENT_MOCK, FILE_DOCUMENT_MOCK]);
            fixture.detectChanges();
            expect(await attachButton.isDisabled()).toBe(true);
        });

        it('should enable the attach button when selection mode is multiple and at least one document is selected', async () => {
            const attachButton = await loader.getHarness(
                MatButtonHarness.with({
                    text: 'ATTACH_FILE_DIALOG.ACTIONS.ATTACH',
                })
            );
            component.data.selectionMode = SelectionMode.multiple;

            component.chosenDocuments$.next([]);
            fixture.detectChanges();
            expect(await attachButton.isDisabled()).toBe(true);

            component.chosenDocuments$.next([FILE_DOCUMENT_MOCK]);
            fixture.detectChanges();
            expect(await attachButton.isDisabled()).toBe(false);

            component.chosenDocuments$.next([FILE_DOCUMENT_MOCK, FILE_DOCUMENT_MOCK]);
            fixture.detectChanges();
            expect(await attachButton.isDisabled()).toBe(false);

            component.data.selectionMode = SelectionMode.single;
        });
    });

    describe(`when content upload is not available and ${STUDIO_HXP.ATTACH_FILE_WIDGET_DEFAULT_FOLDER} is on`, () => {
        const testPath = '/test/path';
        const mockDialogData: AttachFileDialogData = {
            selectionMode: SelectionMode.single,
            selectionSubject$: new Subject<Document[]>(),
            isLocalUploadAvailable: true,
            isContentUploadAvailable: false,
            defaultDocumentPath$: of(testPath),
        };

        beforeEach(async () => {
            TestBed.overrideProvider(MAT_DIALOG_DATA, {
                useValue: mockDialogData,
            });
            documentService = TestBed.inject(DocumentService);
            notificationService = TestBed.inject(HxpNotificationService);

            const featureService = TestBed.inject(FeaturesServiceToken);
            spyOn(featureService, 'isOn$').and.returnValue(of(true));

            getDocumentByPathSpy = spyOn(documentService, 'getDocumentByPath').and.returnValue(of(CONTENT_REPOSITORY_DEFAULT_FOLDER_MOCK));

            getAllChildrenSpy = spyOn(documentService, 'getAllChildren').and.returnValue(of(FOLDER_DOCUMENT_COLLECTION_MOCK));

            fixture = TestBed.createComponent(AttachFileDialogComponent);
            component = fixture.componentInstance;
            loader = TestbedHarnessEnvironment.loader(fixture);
        });

        it('should enable local tab only', async () => {
            const tabs = await loader.getAllHarnesses(MatTabHarness);
            expect(tabs.length).toBe(2);

            const contentTab = tabs[0];
            const uploadTab = tabs[1];
            expect(await contentTab.getLabel()).toBe('ATTACH_FILE_DIALOG.TABS.REPOSITORY');
            expect(await contentTab.isDisabled()).toBe(true);
            expect(await contentTab.isSelected()).toBe(false);
            expect(await uploadTab.getLabel()).toBe('ATTACH_FILE_DIALOG.TABS.LOCAL_STORAGE');
            expect(await uploadTab.isDisabled()).toBe(false);
            expect(await uploadTab.isSelected()).toBe(true);
        });

        it('should attach button be visible', async () => {
            const attachButton = await loader.getHarness(
                MatButtonHarness.with({
                    text: 'ATTACH_FILE_DIALOG.ACTIONS.ATTACH',
                })
            );
            expect(attachButton).toBeDefined();
        });
    });
});
