/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppConfigService } from '@alfresco/adf-core';
import { IdpBackendService } from './idp-backend.service';
import { IdpFileMetadata } from '../../models/api-models/idp-api-recognition-models';

describe('IdpBackendService', () => {
    const mockBackendBaseUrl = 'https://localhost';
    const mockAppConfigService = {
        get: jasmine.createSpy('get').and.returnValue(mockBackendBaseUrl),
    };

    let service: IdpBackendService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [IdpBackendService, { provide: AppConfigService, useValue: mockAppConfigService }],
        });

        service = TestBed.inject(IdpBackendService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get file metadata', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const jobResponse: IdpFileMetadata = { status: 'Succeeded', pageCount: 10, pages: [] };

        let result;
        service.getFileMetadata$(correlationId, fileReference).subscribe((response) => {
            result = response;
        });

        const pollReq1 = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/metadata?correlationId=${correlationId}&fileReference=${fileReference}`
        );
        expect(pollReq1.request.method).toBe('GET');
        pollReq1.flush(jobResponse);

        tick(1000);
        expect(result).toEqual(jobResponse);
    }));

    it('should handle error when getting file metadata', fakeAsync(() => {
        let result;
        service.getFileMetadata$('123', 'fileRef').subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(`${mockBackendBaseUrl}/api/recognition/file/metadata?correlationId=123&fileReference=fileRef`);
        expect(req.request.method).toBe('GET');
        req.flush('Error', { status: 500, statusText: 'Server Error' });

        tick(1000);
        expect(result).toBeUndefined();
    }));

    it('should get file page image blob', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const pageIndex = 1;
        const mockBlob = new Blob(['image content'], { type: 'image/png' });

        let result;
        service.getFilePageImageBlob$(correlationId, fileReference, pageIndex).subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page?correlationId=${correlationId}&fileReference=${fileReference}&pageIndex=${pageIndex}&thumbnail=false`
        );
        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('blob');
        expect(req.request.headers.get('Accept')).toBe('image/*');
        req.flush(mockBlob);

        tick(1000);
        expect(result).toEqual(mockBlob);
    }));

    it('should handle error when getting file page image blob', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const pageIndex = 1;

        let result;
        service.getFilePageImageBlob$(correlationId, fileReference, pageIndex).subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page?correlationId=${correlationId}&fileReference=${fileReference}&pageIndex=${pageIndex}&thumbnail=false`
        );
        expect(req.request.method).toBe('GET');
        // eslint-disable-next-line unicorn/no-null
        req.flush(null, { status: 500, statusText: 'Server Error' });

        tick(1000);
        expect(result).toBeUndefined();
    }));

    it('should get file page image blob with thumbnail', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const pageIndex = 1;
        const thumbnail = true;
        const mockBlob = new Blob(['image content'], { type: 'image/png' });

        let result;
        service.getFilePageImageBlob$(correlationId, fileReference, pageIndex, true).subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page?correlationId=${correlationId}&fileReference=${fileReference}&pageIndex=${pageIndex}&thumbnail=${thumbnail}`
        );
        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('blob');
        expect(req.request.headers.get('Accept')).toBe('image/*');
        req.flush(mockBlob);

        tick(1000);
        expect(result).toEqual(mockBlob);
    }));

    it('should handle error when getting file page image blob with thumbnail', fakeAsync(() => {
        const correlationId = '123';
        const fileReference = '456';
        const pageIndex = 1;
        const thumbnail = true;

        let result;
        service.getFilePageImageBlob$(correlationId, fileReference, pageIndex, true).subscribe((response) => {
            result = response;
        });

        const req = httpMock.expectOne(
            `${mockBackendBaseUrl}/api/recognition/file/page?correlationId=${correlationId}&fileReference=${fileReference}&pageIndex=${pageIndex}&thumbnail=${thumbnail}`
        );
        expect(req.request.method).toBe('GET');
        // eslint-disable-next-line unicorn/no-null
        req.flush(null, { status: 500, statusText: 'Server Error' });

        tick(1000);
        expect(result).toBeUndefined();
    }));

    it('should build URL properly when replacement placeholders are used', () => {
        const correlationId = '123';
        const fileReference = '456';
        mockAppConfigService.get.and.returnValue('https://api.hxidp-<SERVICE_PLACEHOLDER>.hyland.com');

        service.getFileMetadata$(correlationId, fileReference).subscribe(() => {});

        const pollReq1 = httpMock.expectOne(
            `https://api.hxidp-recognition.hyland.com/api/recognition/file/metadata?correlationId=${correlationId}&fileReference=${fileReference}`
        );
        expect(pollReq1.request.method).toBe('GET');
    });
});
