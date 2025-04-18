/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, EventEmitter, Inject, Optional } from '@angular/core';
import { Minimatch } from 'minimatch';
import { EventEmitter as Events } from 'events';

import { Subject } from 'rxjs';
import { AppConfigService } from '@alfresco/adf-core';
import { FileUploadCompleteEvent, FileUploadDeleteEvent, FileUploadErrorEvent, FileUploadEvent } from '../events/file.event';
import { FileReaderService } from './hxp-file-reader.service';
import { FileModel, FileUploadProgress, FileUploadStatus } from '../model/file.model';
import { UploadApi } from '@hylandsoftware/hxcs-js-client';
import { SharedUploadMiddlewareService, UPLOAD_MIDDLEWARE_SERVICE } from '@hxp/shared-hxp/services';
import { UPLOAD_API_TOKEN } from '@alfresco/adf-hx-content-services/api';

type EventListener = (...args: any[]) => void;
type EmitterMethod = (type: string, listener: EventListener) => void;

type ExtendedApiClientPromise<T = any> = Promise<T> & {
    on: EmitterMethod;
    off: EmitterMethod;
    once: EmitterMethod;
    emit: (type: string, ...args: any[]) => void;
    abort?: () => void;
};

@Injectable({
    providedIn: 'root',
})
export class HxpUploadService {
    queue: FileModel[] = [];
    queueChanged: Subject<FileModel[]> = new Subject<FileModel[]>();
    fileUpload: Subject<FileUploadEvent> = new Subject<FileUploadEvent>();
    fileUploadStarting: Subject<FileUploadEvent> = new Subject<FileUploadEvent>();
    fileUploadCancelled: Subject<FileUploadEvent> = new Subject<FileUploadEvent>();
    fileUploadProgress: Subject<FileUploadEvent> = new Subject<FileUploadEvent>();
    fileUploadAborted: Subject<FileUploadEvent> = new Subject<FileUploadEvent>();
    fileUploadError: Subject<FileUploadErrorEvent> = new Subject<FileUploadErrorEvent>();
    fileUploadComplete: Subject<FileUploadCompleteEvent> = new Subject<FileUploadCompleteEvent>();
    fileUploadDeleted: Subject<FileUploadDeleteEvent> = new Subject<FileUploadDeleteEvent>();

    private cache: { [key: string]: any } = {};
    private totalComplete = 0;
    private totalAborted = 0;
    private totalError = 0;
    private excludedFileList: string[] = [];
    private excludedFoldersList: string[] = [];
    private matchingOptions: any = null;
    private folderMatchingOptions: any = null;
    private abortedFile?: string;

    private abortControllers = new WeakMap<FileModel, AbortController>();

    constructor(
        private appConfigService: AppConfigService,
        private fileReaderService: FileReaderService,
        @Inject(UPLOAD_API_TOKEN)
        private uploadApi: UploadApi,
        @Optional()
        @Inject(UPLOAD_MIDDLEWARE_SERVICE)
        private uploadFileMiddleware?: SharedUploadMiddlewareService
    ) {}

    clearCache() {
        this.cache = {};
    }

    /**
     * Returns the number of concurrent threads for uploading.
     *
     * @returns Number of concurrent threads (default 1)
     */
    getThreadsCount(): number {
        return this.appConfigService.get<number>('upload.threads', 1);
    }

    /**
     * Checks whether the service still has files uploading or awaiting upload.
     *
     * @returns True if files in the queue are still uploading, false otherwise
     */
    isUploading(): boolean {
        const finishedFileStates = [
            FileUploadStatus.Complete,
            FileUploadStatus.Cancelled,
            FileUploadStatus.Aborted,
            FileUploadStatus.Error,
            FileUploadStatus.Deleted,
        ];
        return this.queue.reduce(
            (stillUploading: boolean, currentFile: FileModel) => stillUploading || finishedFileStates.indexOf(currentFile.status) === -1,
            false
        );
    }

    /**
     * Gets the file Queue
     *
     * @returns Array of files that form the queue
     */
    getQueue(): FileModel[] {
        return this.queue;
    }

    /**
     * Adds files to the uploading queue to be uploaded
     *
     * @param files One or more separate parameters or an array of files to queue
     * @returns Array of files that were not blocked from upload by the ignore list
     */
    addToQueue(...files: FileModel[]): FileModel[] {
        const allowedFiles = files.filter((currentFile) => this.filterElement(currentFile));
        this.queue = this.queue.concat(allowedFiles);
        this.queueChanged.next(this.queue);
        return allowedFiles;
    }

    /**
     * Finds all the files in the queue that are not yet uploaded and uploads them into the directory folder.
     *
     * @param successEmitter Emitter to invoke on file success status change
     * @param errorEmitter Emitter to invoke on file error status change
     */
    uploadFilesInTheQueue(successEmitter?: EventEmitter<any>, errorEmitter?: EventEmitter<any>): void {
        const files = this.getFilesToUpload();

        if (files && files.length > 0) {
            for (const file of files) {
                this.onUploadStarting(file);

                const promise = this.beginUpload(file, successEmitter, errorEmitter);
                this.cache[file.name] = promise;

                const next = () => {
                    setTimeout(() => this.uploadFilesInTheQueue(successEmitter, errorEmitter), 100);
                };

                promise.next = next;

                promise.then(
                    () => next(),
                    () => next()
                );
            }
        }
    }

    /**
     * Cancels uploading of files.
     *
     * @param files One or more separate parameters or an array of files specifying uploads to cancel
     */
    cancelUpload(...files: FileModel[]) {
        files.forEach((file) => {
            const promise = this.cache[file.name];

            if (promise) {
                promise.abort();
                delete this.cache[file.name];
                promise.next();
            } else {
                const performAction = this.getAction(file);

                if (performAction) {
                    performAction();
                }
            }
        });
    }

    /**
     * Deletes the uploaded file from the server.
     */
    deleteUpload(fileModel: FileModel): void {
        void this.uploadApi.deleteUpload(fileModel.data.id);
    }

    /**
     * Retries the upload of a file.
     */
    retryUpload(fileModel: FileModel): void {
        if (
            fileModel.status === FileUploadStatus.Aborted ||
            fileModel.status === FileUploadStatus.Cancelled ||
            fileModel.status === FileUploadStatus.Error
        ) {
            // reset the file model properties
            fileModel.data = null;
            fileModel.errorCode = null;
            fileModel.progress = {
                loaded: 0,
                total: 0,
                percent: 0,
            };
            fileModel.status = FileUploadStatus.Pending;
        }

        // if the cache is empty, lets trigger the upload of the file in the queue
        if (Object.keys(this.cache).length === 0) {
            this.uploadFilesInTheQueue();
        }
    }

    /** Clears the upload queue */
    clearQueue() {
        this.queue = [];
        this.totalComplete = 0;
        this.totalAborted = 0;
        this.totalError = 0;
    }

    /**
     * Gets an upload promise for a file.
     *
     * @param file The target file
     * @returns Promise that is resolved if the upload is successful or error otherwise
     */
    getUploadPromise(file: FileModel): any {
        return this.createFile(file);
    }

    createFile(fileModel: FileModel): ExtendedApiClientPromise<any> {
        const uploadFileEmitter = new Events.EventEmitter();
        this.abortControllers.set(fileModel, new AbortController());

        const promise = this.uploadFile(fileModel, uploadFileEmitter);
        const decoratedPromise = this.addPromiseListeners(promise, uploadFileEmitter);

        return decoratedPromise;
    }

    async uploadFile(fileModel: FileModel, emitter: Events.EventEmitter) {
        const uploadedFile = this.uploadFileRequest(fileModel.file, this.abortControllers.get(fileModel), emitter).then(async (file) => {
            let middlewareResults: any;

            if (this.uploadFileMiddleware) {
                middlewareResults = await this.uploadFileMiddleware.onUploadFile({
                    uploadedFile: file.data,
                    uploadFileOptions: fileModel.options,
                });
            }

            emitter.emit('success', {
                uploadedFile: file.data,
                uploadFileOptions: fileModel.options,
                middlewareResults,
            });
        });

        return uploadedFile;
    }

    private getFilesToUpload(): FileModel[] {
        const cached = Object.keys(this.cache);
        const threadsCount = this.getThreadsCount();

        if (cached.length >= threadsCount) {
            return [];
        }

        const files = this.queue
            .filter((toUpload) => !cached.includes(toUpload.name) && toUpload.status === FileUploadStatus.Pending)
            .slice(0, threadsCount);

        return files;
    }

    private beginUpload(file: FileModel, successEmitter?: EventEmitter<any>, errorEmitter?: EventEmitter<any>): any {
        const decoratedPromise = this.createFile(file);

        decoratedPromise.on('progress', (progress: FileUploadProgress) => {
            this.onUploadProgress(file, progress);
        });

        decoratedPromise.on('abort', () => {
            this.onUploadAborted(file);
            if (successEmitter) {
                successEmitter.emit({ value: 'File aborted' });
            }
        });

        decoratedPromise.on('error', (err: any) => {
            this.onUploadError(file, err);
            if (errorEmitter) {
                errorEmitter.emit({ error: 'Error file uploaded' });
            }
        });

        decoratedPromise.on('success', (data: any) => {
            if (this.abortedFile === file.name) {
                this.onUploadAborted(file);

                if (successEmitter) {
                    successEmitter.emit({ value: 'File deleted' });
                }
            } else {
                this.onUploadComplete(file, data.uploadedFile);
                if (successEmitter) {
                    successEmitter.emit(data);
                }
            }
        });

        return decoratedPromise;
    }

    private onUploadStarting(file: FileModel): void {
        if (file) {
            file.status = FileUploadStatus.Starting;
            const event = new FileUploadEvent(file, FileUploadStatus.Starting);
            this.fileUpload.next(event);
            this.fileUploadStarting.next(event);
        }
    }

    private addPromiseListeners<T = any>(promise: Promise<T>, emitter: Events.EventEmitter) {
        const extendedPromise = Object.assign(promise, {
            on: function (type: string, listener: EventListener) {
                emitter.on(type, listener);
                return this;
            },
            once: function (type: string, listener: EventListener) {
                emitter.once(type, listener);
                return this;
            },
            emit: function (type: string) {
                emitter.emit(type);
                return this;
            },
            off: function (type: string, listener: EventListener) {
                emitter.off(type, listener);
                return this;
            },
            abort: function () {
                emitter.emit('abort');
                emitter.removeAllListeners('abort');
                return this;
            },
        });

        return extendedPromise;
    }

    private async uploadFileRequest(file: File, abortController: AbortController | undefined, emitter: Events.EventEmitter): Promise<any> {
        let payload: any = file;

        if (file.type === 'application/json') {
            payload = await this.fileReaderService.readFileAsText(file);
        }

        const requestOptions = {
            headers: {
                'Content-Type': file.type,
            },
            onUploadProgress(progressEvent: any) {
                emitter.emit('progress', progressEvent);
            },
            signal: abortController?.signal,
        };

        return this.uploadApi
            .upload(undefined, undefined, undefined, undefined, file.name, undefined, file.type, payload, requestOptions)
            .catch((error) => {
                emitter.emit(error?.message === 'canceled' ? 'abort' : 'error', error);
            });
    }

    private onUploadProgress(file: FileModel, progress: FileUploadProgress): void {
        if (file) {
            file.progress = progress;
            file.status = FileUploadStatus.Progress;

            const event = new FileUploadEvent(file, FileUploadStatus.Progress);
            this.fileUpload.next(event);
            this.fileUploadProgress.next(event);
        }
    }

    private onUploadError(file: FileModel, error: any): void {
        if (file) {
            file.errorCode = (error || {}).status;
            file.status = FileUploadStatus.Error;
            this.totalError++;
            this.deleteAbortController(file);

            const promise = this.cache[file.name];
            if (promise) {
                delete this.cache[file.name];
            }

            const event = new FileUploadErrorEvent(file, error, this.totalError);
            this.fileUpload.next(event);
            this.fileUploadError.next(event);
        }
    }

    private onUploadComplete(file: FileModel, data: any): void {
        if (file) {
            file.status = FileUploadStatus.Complete;
            file.data = data;
            this.totalComplete++;
            const promise = this.cache[file.name];
            if (promise) {
                delete this.cache[file.name];
            }
            this.deleteAbortController(file);

            const event = new FileUploadCompleteEvent(file, this.totalComplete, data, this.totalAborted);
            this.fileUpload.next(event);
            this.fileUploadComplete.next(event);
        }
    }

    private onUploadAborted(fileModel: FileModel): void {
        if (fileModel) {
            const abortController = this.abortControllers.get(fileModel);
            if (abortController) {
                abortController.abort();
                this.deleteAbortController(fileModel);
            }
            fileModel.status = FileUploadStatus.Aborted;
            this.totalAborted++;

            const event = new FileUploadEvent(fileModel, FileUploadStatus.Aborted);
            this.fileUpload.next(event);
            this.fileUploadAborted.next(event);
        }
    }

    private onUploadCancelled(file: FileModel): void {
        if (file) {
            file.status = FileUploadStatus.Cancelled;
            this.deleteAbortController(file);

            const event = new FileUploadEvent(file, FileUploadStatus.Cancelled);
            this.fileUpload.next(event);
            this.fileUploadCancelled.next(event);
        }
    }

    private onUploadDeleted(file: FileModel): void {
        if (file) {
            file.status = FileUploadStatus.Deleted;
            this.totalComplete--;
            this.deleteAbortController(file);

            const event = new FileUploadDeleteEvent(file, this.totalComplete);
            this.fileUpload.next(event);
            this.fileUploadDeleted.next(event);
        }
    }

    private getAction(file: FileModel) {
        const actions = {
            [FileUploadStatus.Pending]: () => this.onUploadCancelled(file),
            [FileUploadStatus.Deleted]: () => this.onUploadDeleted(file),
            [FileUploadStatus.Error]: () => this.onUploadError(file, null),
            [FileUploadStatus.Aborted]: () => {},
            [FileUploadStatus.Cancelled]: () => {},
            [FileUploadStatus.Progress]: () => {},
            [FileUploadStatus.Starting]: () => {},
            [FileUploadStatus.Complete]: () => {},
        };

        return actions[file.status];
    }

    private filterElement(file: FileModel) {
        this.excludedFileList = this.appConfigService.get<string[]>('files.excluded');
        this.excludedFoldersList = this.appConfigService.get<string[]>('folders.excluded');
        let isAllowed = true;

        if (this.excludedFileList) {
            this.matchingOptions = this.appConfigService.get('files.match-options');
            isAllowed = this.isFileNameAllowed(file);
        }

        if (isAllowed && this.excludedFoldersList) {
            this.folderMatchingOptions = this.appConfigService.get('folders.match-options');
            isAllowed = this.isParentFolderAllowed(file);
        }
        return isAllowed;
    }

    private isParentFolderAllowed(file: FileModel): boolean {
        let isAllowed = true;

        const currentFile: any = file.file;
        const fileRelativePath = currentFile.webkitRelativePath ? currentFile.webkitRelativePath : file.options.path;
        if (currentFile && fileRelativePath) {
            isAllowed =
                this.excludedFoldersList.filter((folderToExclude) =>
                    fileRelativePath.split('/').some((pathElement: string) => {
                        const minimatch = new Minimatch(folderToExclude, this.folderMatchingOptions);
                        return minimatch.match(pathElement);
                    })
                ).length === 0;
        }
        return isAllowed;
    }

    private isFileNameAllowed(file: FileModel): boolean {
        return (
            this.excludedFileList.filter((pattern) => {
                const minimatch = new Minimatch(pattern, this.matchingOptions);
                return minimatch.match(file.name);
            }).length === 0
        );
    }

    private deleteAbortController(fileModel: FileModel): void {
        this.abortControllers.delete(fileModel);
    }
}
