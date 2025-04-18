/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable, of, switchMap, take, tap, withLatestFrom } from 'rxjs';
import { FieldVerificationRootState } from '../../store/states/root.state';
import { Store } from '@ngrx/store';
import { selectPageById } from '../../store/selectors/document.selectors';
import { selectCorrelationId } from '../../store/selectors/screen.selectors';
import { IdpBackendService, IdpFilePageOcrData, IdpImageInfo, IdpSharedImageLoadingService } from '@hxp/workspace-hxp/idp-services-extension/shared';

@Injectable()
export class IdpImageLoadingService {
    constructor(
        private readonly store: Store<FieldVerificationRootState>,
        private readonly sharedImageLoadingService: IdpSharedImageLoadingService,
        private readonly idpBackendService: IdpBackendService
    ) {}

    getImageDataForPage$(pageId: string, thumbnail = false): Observable<IdpImageInfo | undefined> {
        return this.store.select(selectPageById(pageId)).pipe(
            take(1),
            withLatestFrom(this.store.select(selectCorrelationId)),
            switchMap(([page, correlationId]) => {
                if (!page) {
                    // eslint-disable-next-line unicorn/no-useless-undefined
                    return of(undefined);
                }

                return this.sharedImageLoadingService.getImageDataForPage$(
                    pageId,
                    page.fileReference,
                    page.sourcePageIndex,
                    correlationId,
                    thumbnail
                );
            })
        );
    }

    // The OCR backend service should set cache headers so we can let the browser cache the response.

    getPageOcrData$(pageId: string) {
        return this.ocrCache(pageId);
    }

    private readonly ocrCache = cacheObservable((pageId: string) => this._getPageOcrData$(pageId), { maxSize: 10 });

    private _getPageOcrData$(pageId: string): Observable<IdpFilePageOcrData | undefined> {
        return this.store.select(selectPageById(pageId)).pipe(
            take(1),
            withLatestFrom(this.store.select(selectCorrelationId)),
            switchMap(([page, correlationId]) => {
                if (!page) {
                    // eslint-disable-next-line unicorn/no-useless-undefined
                    return of(undefined);
                }
                return this.idpBackendService.getPageOcr$(correlationId, page.fileReference, page.sourcePageIndex);
            })
            // takeUntilDestroyed(this.destroyRef),
        );
    }

    cleanup(): void {
        this.sharedImageLoadingService.cleanup();
    }
}

function cacheObservable<K, V>(func: (k: K) => Observable<V>, { maxSize }: { maxSize?: number }) {
    const inFlightCache = new Map<K, Observable<V>>();
    const resultCache = new Map<K, V>();
    return (key: K) => {
        if (resultCache.has(key)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return of(resultCache.get(key)!);
        }

        if (inFlightCache.has(key)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return inFlightCache.get(key)!;
        }

        if (maxSize && resultCache.size >= maxSize) {
            const firstKey = resultCache.keys().next().value;
            if (firstKey) {
                resultCache.delete(firstKey);
            }
        }

        const obs$ = func(key).pipe(
            tap((result) => {
                resultCache.set(key, result);
                inFlightCache.delete(key);
            })
        );
        inFlightCache.set(key, obs$);
        return obs$;
    };
}
