/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IdpBoundingBox, IdpDocument, IdpField } from '../../models/screen-models';
import { selectDocument } from '../../store/selectors/document.selectors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { userActions } from '../../store/actions/field-verification.actions';
import { selectActiveField } from '../../store/selectors/document-field.selectors';

@Injectable()
export class IdpVerificationService {
    readonly document$: Observable<IdpDocument>;
    readonly activeField$: Observable<IdpField | undefined>;

    constructor(private readonly store: Store, destroyRef: DestroyRef) {
        this.document$ = store.select(selectDocument).pipe(takeUntilDestroyed(destroyRef));
        this.activeField$ = store.select(selectActiveField).pipe(takeUntilDestroyed(destroyRef));
    }

    updateRejectReason(rejectReasonId: string, rejectNote?: string): void {
        this.store.dispatch(userActions.rejectReasonUpdate({ rejectReasonId, rejectNote }));
    }

    updateField(field: IdpField, boundingBox?: IdpBoundingBox): void {
        this.store.dispatch(
            userActions.fieldValueUpdate({
                fieldId: field.id,
                value: field.value ?? '',
                boundingBox,
            })
        );
    }

    selectField(field: IdpField) {
        this.store.dispatch(userActions.fieldSelect({ fieldId: field.id }));
    }

    selectNextField(): void {
        this.store.dispatch(userActions.selectNextField());
    }
}

function equalsIgnoreCase(left: string, right: string) {
    return left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0;
}

function startsWithIgnoreCase(value: string, search: string) {
    if (value.length < search.length) {
        return false;
    }
    const start = value.slice(0, search.length);
    return equalsIgnoreCase(start, search);
}

export interface BasicOcrWord {
    text: string;
    pageId: string;
}

export function* findOcrMatches<T extends BasicOcrWord>(ocrWords: T[], search: string, caseSensitive = false) {
    const searchStrings = search.split(/\s+/);
    for (let ocrStartIndex = 0; ocrStartIndex < ocrWords.length; ocrStartIndex++) {
        let ocrPageId;
        for (let nextOffset = 0; ; nextOffset++) {
            const ocrNextIndex = ocrStartIndex + nextOffset;
            if (nextOffset >= searchStrings.length) {
                yield ocrWords.slice(ocrStartIndex, ocrNextIndex); // pending text matches this sequence of ocr words
            }
            if (ocrNextIndex >= ocrWords.length) {
                break; // reached the end of ocr words without finishing the match
            }
            const ocrWord = ocrWords[ocrNextIndex];
            if (ocrPageId && ocrPageId !== ocrWord.pageId) {
                break; // do not cross page boundary in the middle of a match
            }

            const getComparer = () => {
                const isLastWord = nextOffset === searchStrings.length - 1;
                if (isLastWord) {
                    // the last word can be a partial starts-with match
                    return caseSensitive ? (left: string, right: string) => left.startsWith(right) : startsWithIgnoreCase;
                } else {
                    return caseSensitive ? (left: string, right: string) => left.localeCompare(right) === 0 : equalsIgnoreCase;
                }
            };

            const comparer = getComparer();
            if (!comparer(ocrWord.text, searchStrings[nextOffset])) {
                break; // this sequence of ocr words does not match the pending value
            }
            ocrPageId = ocrWord.pageId;
        }
    }
}

export function findSingleTypeaheadMatch<T extends BasicOcrWord>(suggestions: T[], search: string) {
    const exactMatch = single(findOcrMatches(suggestions, search, true));
    if (exactMatch) {
        return exactMatch; // single exact match is perfect
    }

    const caseInsensitiveMatches = [...findOcrMatches(suggestions, search, false)];
    if (caseInsensitiveMatches.length > 0) {
        const firstMatch = caseInsensitiveMatches[0];
        if (
            caseInsensitiveMatches.every(
                (match) => match.length === firstMatch.length && match.every((word, index) => equalsIgnoreCase(word.text, firstMatch[index].text))
            )
        ) {
            return firstMatch; // take first case-insensitive match as long as there is no ambiguity
        }
    }

    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
}

function single<T>(source: Iterable<T>) {
    let result;
    let foundAlready = false;
    for (const value of source) {
        if (foundAlready) {
            // compiler wants explicit undefined but linter does not; compiler wins
            // eslint-disable-next-line unicorn/no-useless-undefined
            return undefined;
        }
        result = value;
        foundAlready = true;
    }
    return result;
}
