/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService } from '@alfresco/adf-core';
import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of } from 'rxjs';
import { SHOULD_ADD_AUTH_TOKEN } from '@alfresco/adf-core/auth';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { IdpFileMetadata, IdpFilePageOcrData } from '../../models/api-models/idp-api-recognition-models';

class IdpUrlEndpoint {
    service: string;
    endpoint: string;

    constructor(service: string, endpoint: string) {
        this.service = service;
        this.endpoint = endpoint;
    }

    build() {
        return `api/${this.service}/${this.endpoint}`;
    }
}

const IDP_SERVICE_REPLACE_PLACEHOLDER = '<SERVICE_PLACEHOLDER>';

const IDP_SERVICES = {
    RECOGNITION_SERVICE: 'recognition',
} as const;

const IDP_URLS = {
    FILE_PAGE: new IdpUrlEndpoint(IDP_SERVICES.RECOGNITION_SERVICE, 'file/page'),
    FILE_METADATA: new IdpUrlEndpoint(IDP_SERVICES.RECOGNITION_SERVICE, 'file/metadata'),
    FILE_PAGE_OCR: new IdpUrlEndpoint(IDP_SERVICES.RECOGNITION_SERVICE, 'file/page/ocr'),
} as const;

@Injectable()
export class IdpBackendService {
    constructor(private readonly appConfig: AppConfigService, private readonly httpClient: HttpClient, private readonly destroyRef: DestroyRef) {}

    getFileMetadata$(correlationId: string, fileReference: string): Observable<IdpFileMetadata | undefined> {
        const pollJobQueryParams = new HttpParams().set('correlationId', correlationId).set('fileReference', fileReference);

        return this.request$<IdpFileMetadata>('GET', IDP_URLS.FILE_METADATA, { queryParams: pollJobQueryParams }).pipe(
            takeUntilDestroyed(this.destroyRef),
            map((response) => {
                if (response?.status !== 'Succeeded') {
                    throw new Error('Failed to get file metadata');
                }

                return response;
            }),
            // eslint-disable-next-line unicorn/no-useless-undefined
            catchError(() => of(undefined))
        );
    }

    getFilePageImageBlob$(correlationId: string, fileReference: string, pageIndex: number, thumbnail = false): Observable<Blob | undefined> {
        const pollJobQueryParams = new HttpParams()
            .set('correlationId', correlationId)
            .set('fileReference', fileReference)
            .set('pageIndex', pageIndex)
            .set('thumbnail', thumbnail);
        return this.getImageBlob$(IDP_URLS.FILE_PAGE, { queryParams: pollJobQueryParams }).pipe(
            takeUntilDestroyed(this.destroyRef),
            // eslint-disable-next-line unicorn/no-useless-undefined
            catchError(() => of(undefined))
        );
    }

    getPageOcr$(correlationId: string, fileReference: string, pageIndex: number): Observable<IdpFilePageOcrData | undefined> {
        const queryParams = new HttpParams().set('correlationId', correlationId).set('fileReference', fileReference).set('pageIndex', pageIndex);
        return this.request$<IdpFilePageOcrData>('GET', IDP_URLS.FILE_PAGE_OCR, { queryParams: queryParams }).pipe(
            takeUntilDestroyed(this.destroyRef),
            // eslint-disable-next-line unicorn/no-useless-undefined
            catchError(() => of(undefined))
        );
    }

    private buildUrl(endPoint: IdpUrlEndpoint): string {
        const baseUrl = this.appConfig.get<string>('hxIdpHost').replace(IDP_SERVICE_REPLACE_PLACEHOLDER, endPoint.service);
        return new URL(endPoint.build(), baseUrl).toString();
    }

    private request$<T>(
        httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        endPoint: IdpUrlEndpoint,
        options: {
            bodyParam?: unknown;
            queryParams?: HttpParams;
        }
    ): Observable<T> {
        const url = this.buildUrl(endPoint);

        return this.httpClient.request<T>(httpMethod, url, {
            context: new HttpContext().set(SHOULD_ADD_AUTH_TOKEN, true),
            body: options.bodyParam,
            params: options.queryParams,
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }),
        });
    }

    private getImageBlob$(
        endPoint: IdpUrlEndpoint,
        options: {
            queryParams?: HttpParams;
        }
    ): Observable<Blob> {
        const url = this.buildUrl(endPoint);

        return this.httpClient.get(url, {
            context: new HttpContext().set(SHOULD_ADD_AUTH_TOKEN, true),
            params: options.queryParams,
            responseType: 'blob',
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Accept: 'image/*',
            }),
        });
    }
}
