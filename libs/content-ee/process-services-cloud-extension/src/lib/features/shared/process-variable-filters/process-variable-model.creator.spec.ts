/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { DateCloudFilterType, DateRangeFilter, DateRangeFilterService } from '@alfresco/adf-process-services-cloud';
import {
    DATE_OPTIONS,
    NumberFilterOperatorType,
    ProcessVariableDateFilter,
    ProcessVariableFilterModelExtension,
    ProcessVariableModelCreator,
    ProcessVariableNumberFilter,
    ProcessVariableRadioFilter,
    ProcessVariableStringFilter,
} from '@alfresco-dbp/shared-filters-services';

describe('ProcessVariableModelCreator', () => {
    let service: ProcessVariableModelCreator;
    let dateRangeFilterMock: DateRangeFilter;

    beforeEach(() => {
        dateRangeFilterMock = {
            startDate: '2024-09-20T22:00:00.000Z',
            endDate: '2024-09-21T22:00:00.000Z',
        };

        TestBed.configureTestingModule({
            providers: [
                MockProvider(DateRangeFilterService, {
                    getDateRange() {
                        return dateRangeFilterMock;
                    },
                }),
            ],
        });

        service = TestBed.inject(ProcessVariableModelCreator);
    });

    it('should create filter model for string type', () => {
        const processStringFilter = new ProcessVariableStringFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'string',
                operator: 'eq',
            },
            name: 'name',
            translationKey: 'name',
            value: ['value'],
            visible: true,
        });

        const expectedModel: ProcessVariableFilterModelExtension = {
            name: processStringFilter.data.variableName,
            processDefinitionKey: processStringFilter.data.processDefinitionKey,
            type: processStringFilter.data.variableType,
            operator: 'like',
            value: 'value',
        };

        const model = service.createProcessVariableFilters([processStringFilter]);
        expect(model).toEqual([expectedModel]);
    });

    it('should create filter model for integer type', () => {
        const processNumberFilter = new ProcessVariableNumberFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'integer',
                operator: 'eq',
            },
            name: 'name',
            translationKey: 'name',
            value: {
                value1: 1,
                value2: null,
                operator: NumberFilterOperatorType.EQUALS,
            },
            visible: true,
        });

        const expectedModel: ProcessVariableFilterModelExtension = {
            data: NumberFilterOperatorType.EQUALS,
            name: processNumberFilter.data.variableName,
            processDefinitionKey: processNumberFilter.data.processDefinitionKey,
            type: processNumberFilter.data.variableType,
            operator: 'eq',
            value: 1,
        };

        const model = service.createProcessVariableFilters([processNumberFilter]);
        expect(model).toEqual([expectedModel]);
    });

    it(`should create filter model for ${NumberFilterOperatorType.BETWEEN} integer type`, () => {
        const processNumberFilter = new ProcessVariableNumberFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'integer',
                operator: 'eq',
            },
            name: 'name',
            translationKey: 'name',
            value: {
                value1: 1,
                value2: 2,
                operator: NumberFilterOperatorType.BETWEEN,
            },
            visible: true,
        });

        const expectedGreaterThenModel: ProcessVariableFilterModelExtension = {
            data: NumberFilterOperatorType.BETWEEN,
            name: processNumberFilter.data.variableName,
            processDefinitionKey: processNumberFilter.data.processDefinitionKey,
            type: processNumberFilter.data.variableType,
            operator: 'gte',
            value: 1,
        };

        const expectedLessThenModel: ProcessVariableFilterModelExtension = {
            data: NumberFilterOperatorType.BETWEEN,
            name: processNumberFilter.data.variableName,
            processDefinitionKey: processNumberFilter.data.processDefinitionKey,
            type: processNumberFilter.data.variableType,
            operator: 'lte',
            value: 2,
        };

        const model = service.createProcessVariableFilters([processNumberFilter]);
        expect(model).toEqual([expectedGreaterThenModel, expectedLessThenModel]);
    });

    it(`should create filter model for ${DateCloudFilterType.WEEK} date type`, () => {
        const processDateFilter = new ProcessVariableDateFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'date',
                operator: '',
            },
            name: 'name',
            translationKey: 'name',
            value: {
                range: null,
                selectedOption: {
                    value: DateCloudFilterType.WEEK,
                    label: 'FILTERS.DATE_FILTER.WEEK',
                },
            },
            options: DATE_OPTIONS,
            visible: true,
        });

        const expectedGreaterThenModel: ProcessVariableFilterModelExtension = {
            data: DateCloudFilterType.WEEK,
            name: processDateFilter.data.variableName,
            processDefinitionKey: processDateFilter.data.processDefinitionKey,
            type: processDateFilter.data.variableType,
            operator: 'gte',
            value: dateRangeFilterMock.startDate.slice(0, 10),
        };

        const expectedLessThenModel: ProcessVariableFilterModelExtension = {
            data: DateCloudFilterType.WEEK,
            name: processDateFilter.data.variableName,
            processDefinitionKey: processDateFilter.data.processDefinitionKey,
            type: processDateFilter.data.variableType,
            operator: 'lte',
            value: dateRangeFilterMock.endDate.slice(0, 10),
        };

        const model = service.createProcessVariableFilters([processDateFilter]);
        expect(model).toEqual([expectedGreaterThenModel, expectedLessThenModel]);
    });

    it('should create filter model for boolean type', () => {
        const processBooleanFilter = new ProcessVariableRadioFilter({
            data: {
                processDefinitionKey: 'processDefinitionKey',
                variableName: 'variableName',
                variableType: 'boolean',
                operator: 'eq',
            },
            name: 'name',
            translationKey: 'name',
            value: {
                value: 'true',
                label: 'true',
            },
            visible: true,
            options: [
                { label: 'true', value: 'true' },
                { label: 'false', value: 'false' },
            ],
        });

        const expectedModel: ProcessVariableFilterModelExtension = {
            name: processBooleanFilter.data.variableName,
            processDefinitionKey: processBooleanFilter.data.processDefinitionKey,
            type: processBooleanFilter.data.variableType,
            operator: 'eq',
            value: 'true',
        };

        const model = service.createProcessVariableFilters([processBooleanFilter]);
        expect(model).toEqual([expectedModel]);
    });
});
