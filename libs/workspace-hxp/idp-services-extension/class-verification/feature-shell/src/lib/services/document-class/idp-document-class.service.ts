/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, Injectable } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { DocumentClassMetadata, IdpConfigClass } from '../../models/screen-models';
import { ClassVerificationRootState } from '../../store/states/root.state';
import { selectAllDocumentClasses, selectClassMetadata, selectSelectedDocumentClass } from '../../store/selectors/document.selectors';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { userActions } from '../../store/actions/class-verification.actions';
import { selectViewFilter } from '../../store/selectors/screen.selectors';
import { IdpScreenViewFilter } from '../../models/common-models';

@Injectable()
export class IdpDocumentClassService {
    readonly selectedClass$: Observable<IdpConfigClass | undefined>;
    readonly allClasses$: Observable<IdpConfigClass[]>;
    readonly documentClassMetadata$: Observable<DocumentClassMetadata[]>;

    constructor(private readonly store: Store<ClassVerificationRootState>, destroyRef: DestroyRef) {
        this.allClasses$ = store.select(selectAllDocumentClasses).pipe(takeUntilDestroyed(destroyRef));
        this.selectedClass$ = store.select(selectSelectedDocumentClass).pipe(
            takeUntilDestroyed(destroyRef),
            distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
        );

        this.documentClassMetadata$ = combineLatest([
            store.select(selectClassMetadata).pipe(takeUntilDestroyed(destroyRef)),
            store.select(selectViewFilter),
        ]).pipe(
            takeUntilDestroyed(destroyRef),
            map(([docClassMetadata, viewFilter]) => {
                const sortedClassData = docClassMetadata.sort((a, b) => {
                    if (a.isSpecialClass || b.isSpecialClass) {
                        return a.isSpecialClass === b.isSpecialClass ? 0 : a.isSpecialClass ? -1 : 1;
                    }
                    if (a.documentsCount !== b.documentsCount) {
                        return b.documentsCount - a.documentsCount;
                    }
                    return 0;
                });

                return viewFilter === IdpScreenViewFilter.OnlyIssues
                    ? sortedClassData.filter((classItem) => classItem.issuesCount > 0)
                    : sortedClassData;
            })
        );

        // Reset Selection when class changes
        this.selectedClass$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
            store.dispatch(userActions.pageSelect({ pageIds: [] }));
        });
    }

    setSelectedClass(classId: string): void {
        this.store.dispatch(userActions.classSelect({ classId }));
    }

    toggleExpandClass(classId: string): void {
        this.store.dispatch(userActions.classExpandToggle({ classId }));
    }

    togglePreviewClass(classId?: string): void {
        this.store.dispatch(userActions.classPreviewToggle({ classId }));
    }
}
