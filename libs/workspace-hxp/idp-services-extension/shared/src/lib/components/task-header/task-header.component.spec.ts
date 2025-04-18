/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { IdpContextTaskBaseService } from '../../services/context-task/context-task-base.service';
import { Subject } from 'rxjs';
import { TaskHeaderComponent } from './task-header.component';

describe('TaskHeaderComponent', () => {
    let fixture: ComponentFixture<TaskHeaderComponent>;
    let component: TaskHeaderComponent;
    let contextTaskService: IdpContextTaskBaseService;
    let taskInfoSubject$: Subject<any>;

    class MockContextTaskService implements Partial<IdpContextTaskBaseService> {
        taskInfo$ = taskInfoSubject$.asObservable();
        cancelTask = jasmine.createSpy('cancelTask');
    }

    beforeEach(() => {
        taskInfoSubject$ = new Subject();

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, TaskHeaderComponent],
            providers: [{ provide: IdpContextTaskBaseService, useClass: MockContextTaskService }],
        });

        fixture = TestBed.createComponent(TaskHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        contextTaskService = TestBed.inject(IdpContextTaskBaseService);
    });

    it('should cancel task when goBack is called', () => {
        component.goBack();
        expect(contextTaskService.cancelTask).toHaveBeenCalled();
    });

    it('should have headerInfo$ observable', fakeAsync(() => {
        let receivedValue: any;
        component.headerInfo$.subscribe((info) => {
            receivedValue = info;
        });

        taskInfoSubject$.next({ taskId: '1', taskName: 'Test Task' });
        tick(2000);
        expect(receivedValue).toEqual({ taskId: '1', taskName: 'Test Task' });

        // eslint-disable-next-line unicorn/no-useless-undefined
        taskInfoSubject$.next(undefined);
        tick(2000);
        expect(receivedValue).toEqual({ taskId: '1', taskName: 'Test Task' });

        taskInfoSubject$.next({ taskId: '2', taskName: 'Another Task' });
        tick(2000);
        expect(receivedValue).toEqual({ taskId: '2', taskName: 'Another Task' });
    }));
});
