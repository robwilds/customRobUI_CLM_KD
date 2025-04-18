/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ProcessVariableModelCreator } from './process-variable-model.creator';
import { DateCloudFilterType, DateRangeFilterService } from '@alfresco/adf-process-services-cloud';
import { VariableDateModelCreator } from './variable-model-creators/date-model.creator';
import { DateFilterValue, NumberFilterOperatorType, NumberFilterValue, ProcessVariableDateFilter, ProcessVariableNumberFilter } from '../filter';
import { mapNumberOperatorsToProcessFilterOperator } from './mappers';

const createProcessNumberFilter = (name: string, variableType: 'bigdecimal' | 'integer', value: NumberFilterValue): ProcessVariableNumberFilter => {
    return new ProcessVariableNumberFilter({
        data: {
            variableType,
            operator: mapNumberOperatorsToProcessFilterOperator(value.operator),
            processDefinitionKey: `${name}ProcessDefinitionKey`,
            variableName: name,
        },
        name: name,
        value,
        translationKey: `${name}TranslationKey`,
        visible: true,
    });
};

const createProcessDateFilter = (name: string, variableType: 'date' | 'datetime', value: DateFilterValue | null): ProcessVariableDateFilter => {
    return new ProcessVariableDateFilter({
        data: {
            variableType,
            operator: value.selectedOption?.value ?? '',
            processDefinitionKey: `${name}ProcessDefinitionKey`,
            variableName: name,
        },
        name: 'date',
        value,
        options: [],
        translationKey: `${name}TranslationKey`,
        visible: true,
    });
};

describe('ProcessVariableModelCreator', () => {
    const TODAY = '2020-01-01';
    let processVariableModelCreatorService: ProcessVariableModelCreator;

    let bigdecimalEqualsFilter: ProcessVariableNumberFilter;
    let bigdecimalEmptyFilter: ProcessVariableNumberFilter;

    let dateTodayFilter: ProcessVariableDateFilter;
    let dateEmptyFilter: ProcessVariableDateFilter;

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date(TODAY));
    });

    beforeEach(() => {
        bigdecimalEqualsFilter = createProcessNumberFilter('bigdecimalEqualsFilter', 'bigdecimal', {
            operator: NumberFilterOperatorType.EQUALS,
            value1: 1,
            value2: null,
        });

        bigdecimalEmptyFilter = createProcessNumberFilter('bigdecimalEmptyFilter', 'bigdecimal', {
            operator: NumberFilterOperatorType.EQUALS,
            value1: null,
            value2: null,
        });

        dateTodayFilter = createProcessDateFilter('dateTodayFilter', 'date', {
            selectedOption: { label: 'label', value: DateCloudFilterType.TODAY },
            range: null,
        });

        dateEmptyFilter = createProcessDateFilter('dateEmptyFilter', 'date', {
            selectedOption: null,
            range: null,
        });

        TestBed.configureTestingModule({
            providers: [ProcessVariableModelCreator, DateRangeFilterService, VariableDateModelCreator],
        });

        processVariableModelCreatorService = TestBed.inject(ProcessVariableModelCreator);
    });

    it('should return "date" model only when filter value is set', () => {
        const dateFilters: ProcessVariableDateFilter[] = [dateTodayFilter, dateEmptyFilter];

        const models = processVariableModelCreatorService.createProcessVariableFilters(dateFilters);

        expect(models.length).toBe(1);
        expect(models[0]).toEqual({
            processDefinitionKey: dateTodayFilter.data.processDefinitionKey,
            name: dateTodayFilter.data.variableName,
            type: 'date',
            value: TODAY,
            operator: 'eq',
            data: DateCloudFilterType.TODAY,
        });
    });

    it('should return "bigdecimal" model only when filter value is set', () => {
        const dateFilters: ProcessVariableNumberFilter[] = [bigdecimalEqualsFilter, bigdecimalEmptyFilter];

        const models = processVariableModelCreatorService.createProcessVariableFilters(dateFilters);

        expect(models.length).toBe(1);
        expect(models[0]).toEqual({
            processDefinitionKey: bigdecimalEqualsFilter.data.processDefinitionKey,
            name: bigdecimalEqualsFilter.data.variableName,
            type: 'bigdecimal',
            value: bigdecimalEqualsFilter.value.value1,
            operator: 'eq',
            data: NumberFilterOperatorType.EQUALS,
        });
    });
});
