/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormFieldModel } from '@alfresco/adf-core';

export const formWithUploadWidgets = [
    {
        fieldType: 'ContainerRepresentation',
        id: '7c01ed35-be86-4be7-9c28-ed640a5a2ae1',
        name: 'Label',
        type: 'container',
        tab: null,
        numberOfColumns: 2,
        fields: {
            '1': [
                {
                    fieldType: 'AttachFileFieldRepresentation',
                    id: 'attachFile1',
                    name: 'Attach file1',
                    type: 'upload',
                    value: null,
                    required: false,
                    readOnly: true,
                    overrideId: false,
                    colspan: 1,
                    placeholder: null,
                    visibilityCondition: null,
                    params: {
                        existingColspan: 1,
                        maxColspan: 2,
                        fileSource: {
                            serviceId: 'all-file-sources',
                            name: 'All file sources',
                        },
                        multiple: false,
                        link: false,
                    },
                },
            ],
            '2': [
                {
                    fieldType: 'AttachFileFieldRepresentation',
                    id: 'attachFile2',
                    name: 'Attach file2',
                    type: 'upload',
                    value: null,
                    required: false,
                    readOnly: true,
                    overrideId: false,
                    colspan: 1,
                    placeholder: null,
                    visibilityCondition: null,
                    params: {
                        existingColspan: 1,
                        maxColspan: 2,
                        fileSource: {
                            serviceId: 'all-file-sources',
                            name: 'All file sources',
                        },
                        multiple: false,
                        link: false,
                    },
                },
                {
                    id: 'subject',
                    name: 'Subject',
                    type: 'text',
                    readOnly: false,
                    required: false,
                    colspan: 1,
                    rowspan: 1,
                    placeholder: null,
                    minLength: 0,
                    maxLength: 0,
                    regexPattern: null,
                    visibilityCondition: null,
                    params: {
                        existingColspan: 1,
                        maxColspan: 2,
                    },
                },
                {
                    id: 'content',
                    name: 'Email Content',
                    type: 'multi-line-text',
                    readOnly: false,
                    colspan: 1,
                    rowspan: 1,
                    placeholder: null,
                    minLength: 0,
                    maxLength: 0,
                    regexPattern: null,
                    required: false,
                    visibilityCondition: null,
                    params: {
                        existingColspan: 1,
                        maxColspan: 2,
                    },
                },
            ],
        },
    },
] as unknown as FormFieldModel[];

export const formWithoutUploadWidgets = [
    {
        fieldType: 'ContainerRepresentation',
        id: '26b10e64-0403-4686-a75b-0d45279ce3a8',
        name: 'Label',
        type: 'container',
        tab: null,
        numberOfColumns: 2,
        fields: {
            '1': [
                {
                    fieldType: 'FormFieldRepresentation',
                    id: 'text1',
                    name: 'Text1',
                    type: 'text',
                    value: null,
                    required: false,
                    readOnly: true,
                    overrideId: false,
                    colspan: 1,
                    placeholder: null,
                    minLength: 0,
                    maxLength: 0,
                    minValue: null,
                    maxValue: null,
                    regexPattern: null,
                    visibilityCondition: null,
                    params: {
                        existingColspan: 1,
                        maxColspan: 2,
                    },
                },
            ],
            '2': [
                {
                    fieldType: 'FormFieldRepresentation',
                    id: 'text2',
                    name: 'Text2',
                    type: 'text',
                    value: null,
                    required: false,
                    readOnly: true,
                    overrideId: false,
                    colspan: 1,
                    placeholder: null,
                    minLength: 0,
                    maxLength: 0,
                    minValue: null,
                    maxValue: null,
                    regexPattern: null,
                    visibilityCondition: null,
                    params: {
                        existingColspan: 1,
                        maxColspan: 2,
                    },
                },
            ],
        },
    },
] as unknown as FormFieldModel[];
