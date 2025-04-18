/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    AuthenticationContent,
    AuthenticationCredentialsField,
    AuthenticationFormService,
    SCOPE_REGEXP,
    URL_REGEXP,
} from '@alfresco-dbp/shared-authentication-services';
import { MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { NgIf, NgFor } from '@angular/common';

@Component({
    standalone: true,
    selector: 'authentication-inputs-generator',
    templateUrl: './authentication-inputs-generator.smart-component.html',
    styleUrls: ['./authentication-inputs-generator.smart-component.scss'],
    imports: [NgIf, FormsModule, ReactiveFormsModule, NgFor, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, TranslateModule],
    providers: [AuthenticationFormService],
})
export class AuthenticationInputsGeneratorSmartComponent implements OnChanges {
    @Input()
    authentication: AuthenticationContent;

    @Input()
    formArray: UntypedFormArray;

    @Input()
    authenticationCredentialsFields: AuthenticationCredentialsField[];

    @Input()
    authIndex: number;

    @Input()
    appearance: MatFormFieldAppearance = 'fill';

    constructor(private authenticationFormService: AuthenticationFormService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.authenticationCredentialsFields?.currentValue || this.hasAuthenticationNameChanged(changes)) {
            this.createControllers();
            this.markAuthFormControllersAsTouched();
        }
    }

    private hasAuthenticationNameChanged(changes: SimpleChanges): boolean {
        const authenticationChanges = changes?.authentication;
        return authenticationChanges ? authenticationChanges.previousValue?.name !== authenticationChanges.currentValue?.name : false;
    }

    createControllers() {
        const authFormGroup = this.authenticationFormService.createFormGroupForAuthentication(
            this.authenticationCredentialsFields,
            this.authentication
        );
        this.formArray.push(authFormGroup);
    }

    markAuthFormControllersAsTouched() {
        if (this.authCredentialsFormGroup?.controls) {
            Object.values(this.authCredentialsFormGroup.controls).forEach((formControl: AbstractControl) => {
                formControl.markAsTouched({ onlySelf: true });
            });
        }
    }

    hasRequiredError(fieldKey: string): boolean {
        return this.authCredentialsFormGroup.get(fieldKey)?.errors?.required;
    }

    hasPatternError(fieldKey: string): boolean {
        return this.authCredentialsFormGroup.get(fieldKey)?.errors?.pattern;
    }

    getPatternErrorTranslationKey(fieldKey: string): string {
        const patternError = this.authCredentialsFormGroup.get(fieldKey)?.errors?.pattern.requiredPattern;
        let errorTranslationKey = 'SHARED_AUTHENTICATION.ERRORS.INVALID_FIELD';

        if (this.isUrlError(patternError)) {
            errorTranslationKey = 'SHARED_AUTHENTICATION.ERRORS.URL_ERROR';
        } else if (this.isScopeError(patternError)) {
            errorTranslationKey = 'SHARED_AUTHENTICATION.ERRORS.SCOPE_ERROR';
        }

        return errorTranslationKey;
    }

    isUrlError(pattern: string): boolean {
        return pattern === URL_REGEXP.toString();
    }

    isScopeError(pattern: string): boolean {
        return pattern === SCOPE_REGEXP.toString();
    }

    togglePass(field: AuthenticationCredentialsField) {
        field.isHidden = !field.isHidden;
    }

    getAutomationId(fieldId: string): string {
        return `apa-authentication-${this.authentication.getAuthName()}-${fieldId}`;
    }

    getFieldType(field: AuthenticationCredentialsField): string {
        return field.type === 'password' && field.isHidden ? 'password' : 'text';
    }

    get authFormGroup(): UntypedFormGroup {
        return this.formArray.at(this.authIndex) as UntypedFormGroup;
    }

    getInputFormControl(fieldKey: string): UntypedFormControl {
        return this.authCredentialsFormGroup.get(fieldKey) as UntypedFormControl;
    }

    get authCredentialsFormGroup(): UntypedFormGroup {
        return this.authFormGroup?.get(this.authentication.getAuthKey()) as UntypedFormGroup;
    }
}
