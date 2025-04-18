/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/** Make some properties in T required */
export type SomeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export interface TaskInput {
    /** @deprecated use batchState.contentFileReferences instead */
    contents?: ContentFileReference[];
    rejectReasons: RejectReason[];
    sys_task_assignee?: string;
}

export interface ContentFileReference {
    sys_id: string;
}

export interface ApiDocPage {
    contentFileReferenceIndex: number;
    sourcePageIndex: number;
    autoRotation?: number;
    userRotation?: number;
}

export interface ApiBaseDocument {
    id: string;
    name: string;
    pages: ApiDocPage[];
}

export interface RejectReason {
    id: string;
    value: string;
}
