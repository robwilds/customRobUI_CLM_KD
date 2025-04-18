/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassVerificationRootComponent } from './class-verification-root.component';
import { ClassVerificationContextTaskService } from '../../services/context-task/class-verification-context-task.service';
import { IdpDocumentToolbarService } from '../../services/document/idp-document-toolbar.service';
import { BehaviorSubject } from 'rxjs';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';

@Component({ selector: 'hyland-idp-task-header', template: '', standalone: true })
class MockTaskHeaderComponent {}

@Component({ selector: 'hyland-idp-class-list', template: '', standalone: true })
class MockClassListComponent {}

@Component({ selector: 'hyland-idp-class-verification-viewer', template: '', standalone: true })
class MockViewerComponent {}

describe('ClassVerificationRootComponent', () => {
    let component: ClassVerificationRootComponent;
    let fixture: ComponentFixture<ClassVerificationRootComponent>;
    let contextService: ClassVerificationContextTaskService;
    let documentToolbarService: IdpDocumentToolbarService;

    const toggleScreenReady$ = new BehaviorSubject(true);
    const toggleCanSave$ = new BehaviorSubject(true);
    const toggleCanComplete$ = new BehaviorSubject(true);
    class MockContextService implements Partial<ClassVerificationContextTaskService> {
        screenReady$ = toggleScreenReady$.asObservable();
        taskCanSave$ = toggleCanSave$.asObservable();
        taskCanComplete$ = toggleCanComplete$.asObservable();
        completeTask = jasmine.createSpy('completeTask');
        saveTask = jasmine.createSpy('saveTask');
        destroy = jasmine.createSpy('destroy');
    }

    class MockDocumentToolbarService implements Partial<IdpDocumentToolbarService> {
        handleShortcutAction = jasmine.createSpy('handleShortcutAction');
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ClassVerificationContextTaskService, useClass: MockContextService },
                { provide: IdpDocumentToolbarService, useClass: MockDocumentToolbarService },
            ],
        }).overrideComponent(ClassVerificationRootComponent, {
            set: {
                providers: [],
                imports: [
                    CommonModule,
                    MatButtonModule,
                    MatProgressSpinnerModule,
                    NoopTranslateModule,
                    MockClassListComponent,
                    MockViewerComponent,
                    MockTaskHeaderComponent,
                ],
            },
        });

        fixture = TestBed.createComponent(ClassVerificationRootComponent);
        component = fixture.componentInstance;
        contextService = TestBed.inject(ClassVerificationContextTaskService);
        documentToolbarService = TestBed.inject(IdpDocumentToolbarService);

        fixture.detectChanges();
    });

    it('should call completeTask on onSubmit', () => {
        fixture.debugElement.query(By.css('.idp-footer-container__submit-button')).nativeElement.click();
        expect(contextService.completeTask).toHaveBeenCalled();
    });

    it('should call saveTask on onSave', () => {
        fixture.debugElement.query(By.css('.idp-footer-container__save-button')).nativeElement.click();
        expect(contextService.saveTask).toHaveBeenCalled();
    });

    it('should handle shortcut key', () => {
        const event = new KeyboardEvent('keyup', { key: 'a' });
        component.onKeyUp(event);
        expect(documentToolbarService.handleShortcutAction).toHaveBeenCalledWith(event);
    });

    it('should prevent default action on repeated key event', () => {
        const event = new KeyboardEvent('keyup', { key: 'a', repeat: true });
        spyOn(event, 'preventDefault');
        component.onKeyUp(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should destroy context service on component destroy', () => {
        component.ngOnDestroy();
        expect(contextService.destroy).toHaveBeenCalled();
    });

    it('should show progress spinner based on screenReady', () => {
        toggleScreenReady$.next(false);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-class-verification-root__progress'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.idp-class-verification-root'))).toBeFalsy();

        toggleScreenReady$.next(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-class-verification-root__progress'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.idp-class-verification-root'))).toBeTruthy();
    });

    it('should toggle save button based on taskCanSave', () => {
        toggleCanSave$.next(false);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-footer-container__save-button')).attributes['disabled']).toEqual('true');

        toggleCanSave$.next(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-footer-container__save-button')).attributes['disabled']).toBeUndefined();
    });

    it('should toggle submit button based on taskCanSave', () => {
        toggleCanComplete$.next(false);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-footer-container__submit-button')).attributes['disabled']).toEqual('true');

        toggleCanComplete$.next(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-footer-container__submit-button')).attributes['disabled']).toBeUndefined();
    });
});
