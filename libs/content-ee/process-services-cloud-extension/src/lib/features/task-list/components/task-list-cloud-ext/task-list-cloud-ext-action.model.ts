/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export enum TaskListActionType {
    TASK_DETAILS = 'task-details',
    PROCESS_HISTORY = 'process-history',
}

export interface TaskListActionMenuModel {
    key?: TaskListActionType;
    icon?: string;
    title?: string;
    visible?: boolean;
}
