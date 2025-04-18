/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, Injectable, OnDestroy } from '@angular/core';
import { Observable, of, scan, shareReplay, startWith, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IdpImageInfo } from '../../models/common-models';
import { IdpBackendService } from '../backend/idp-backend.service';

type CacheUpdate = { key: string; value: IdpImageInfo; op: 'add' } | { op: 'clear' };

@Injectable()
export class IdpSharedImageLoadingService implements OnDestroy {
    private readonly maxCacheSize = 100;
    private readonly cacheUpdate$ = new Subject<CacheUpdate>();
    private readonly cache$: Observable<Record<string, IdpImageInfo>>;

    private readonly cancel$ = new Subject<void>();

    constructor(private readonly idpBackendService: IdpBackendService, private readonly destroyRef: DestroyRef) {
        this.cache$ = this.cacheUpdate$.pipe(
            takeUntilDestroyed(this.destroyRef),
            scan((cache, update) => {
                switch (update.op) {
                    case 'add': {
                        if (Object.keys(cache).length >= this.maxCacheSize) {
                            const [key] = Object.keys(cache);
                            URL.revokeObjectURL(cache[key].blobUrl);
                            delete cache[key];
                        }
                        cache[update.key] = update.value;
                        break;
                    }
                    case 'clear': {
                        for (const data of Object.values(cache)) {
                            URL.revokeObjectURL(data.blobUrl);
                        }
                        cache = {};
                        break;
                    }
                }
                return cache;
            }, {} as Record<string, IdpImageInfo>),
            startWith({}),
            shareReplay({ bufferSize: 1, refCount: false })
        );
    }

    ngOnDestroy(): void {
        this.clearCache();
        this.cancel$.next();
        this.cancel$.complete();
    }

    cleanup(): void {
        this.clearCache();
        this.cancel$.next();
    }

    getImageDataForPage$(
        pageId: string,
        fileReference: string,
        sourcePageIndex: number,
        correlationId: string,
        thumbnail: boolean = false
    ): Observable<IdpImageInfo | undefined> {
        return this.cache$.pipe(
            take(1),
            switchMap((cache) => {
                // check if the image data is already in the cache
                const cachedData = cache[thumbnail ? `${pageId}_thumbnail` : pageId];
                if (cachedData) {
                    return of(cachedData);
                }

                return this.idpBackendService.getFileMetadata$(correlationId, fileReference).pipe(
                    switchMap((fileMetadata) => {
                        if (fileMetadata) {
                            const pageMetadata = fileMetadata.pages.find((p) => p.pageIndex === sourcePageIndex);
                            if (!pageMetadata) {
                                // eslint-disable-next-line unicorn/no-useless-undefined
                                return of(undefined);
                            }

                            return this.idpBackendService.getFilePageImageBlob$(correlationId, fileReference, sourcePageIndex, thumbnail).pipe(
                                switchMap((blob) => {
                                    if (blob) {
                                        const blobUrl = URL.createObjectURL(blob);
                                        return of({
                                            blobUrl,
                                            width: pageMetadata.imageWidth,
                                            height: pageMetadata.imageHeight,
                                            correctionAngle: 360 - pageMetadata.rotationAngle,
                                            skew: pageMetadata.skew,
                                        });
                                    }
                                    // eslint-disable-next-line unicorn/no-useless-undefined
                                    return of(undefined);
                                })
                            );
                        }
                        // eslint-disable-next-line unicorn/no-useless-undefined
                        return of(undefined);
                    }),
                    tap(this.cacheImageData.bind(this, thumbnail ? `${pageId}_thumbnail` : pageId)),
                    takeUntil(this.cancel$)
                );
            })
        );
    }

    private cacheImageData(pageId: string, imageData: IdpImageInfo | undefined): void {
        if (!pageId || !imageData) {
            return;
        }

        this.cacheUpdate$.next({ key: pageId, value: imageData, op: 'add' });
    }

    private clearCache(): void {
        this.cacheUpdate$.next({ op: 'clear' });
    }
}
