/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TranslateService } from '@ngx-translate/core';
import { Component, inject, OnInit } from '@angular/core';
import { PublicFormService } from './public-form.service';
import { FormModel, FormValues } from '@alfresco/adf-core';
import { MatButtonModule } from '@angular/material/button';
import { NgTemplateOutlet, Location } from '@angular/common';
import { catchError, EMPTY, forkJoin, map, take } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { FormCloudComponent, FormCloudService, FormCustomOutcomesComponent, FormRepresentation } from '@alfresco/adf-process-services-cloud';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    standalone: true,
    selector: 'hxp-public-form',
    templateUrl: './public-form.component.html',
    styleUrls: ['./public-form.component.scss'],
    imports: [MatProgressSpinnerModule, MatButtonModule, FormCloudComponent, FormCustomOutcomesComponent, NgTemplateOutlet],
    providers: [PublicFormService, { provide: FormCloudService, useClass: PublicFormService }],
})
export class PublicFormComponent implements OnInit {
    private readonly location = inject(Location);
    private readonly translateService = inject(TranslateService);
    private readonly publicFormService = inject(PublicFormService);
    private readonly notificationService = inject(HxpNotificationService);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);

    form!: FormModel;
    loading = true;

    outcome = '';
    showCancelButton = true;
    showStartProcessButton = true;
    cancelButtonLabel = this.translateService.instant('APP.PUBLIC_FORM.ACTIONS.CANCEL').toUpperCase();
    startProcessButtonLabel = this.translateService.instant('APP.PUBLIC_FORM.ACTIONS.START').toUpperCase();

    ngOnInit(): void {
        forkJoin([
            this.publicFormService.fetchFormRepresentation(),
            this.publicFormService.fetchStaticFormValues(),
            this.publicFormService.fetchStartEventConstants(),
        ])
            .pipe(
                take(1),
                catchError(() => {
                    this.loading = false;
                    void this.router.navigate(['/public/error/404']);
                    return EMPTY;
                }),
                map(([{ formRepresentation }, staticFormValues, constants]) => {
                    const flattenedForm = { ...formRepresentation, ...formRepresentation.formDefinition };
                    delete flattenedForm.formDefinition;
                    return {
                        normalizedFormData: flattenedForm,
                        staticFormValues,
                        constants,
                    };
                })
            )
            .subscribe(({ normalizedFormData, staticFormValues, constants }) => {
                this.handleFormLoadSuccess(normalizedFormData, staticFormValues);
                this.handleConstantValues(constants);
            });
    }

    onOutcomeClicked(outcome: string): void {
        this.outcome = outcome;
        this.startProcess();
    }

    cancelStartProcess(): void {
        this.location.back();
    }

    startProcess(): void {
        this.loading = true;
        this.publicFormService
            .startProcess(this.form.values, this.outcome)
            .pipe(
                take(1),
                catchError(() => {
                    this.loading = false;
                    void this.router.navigate(['/public/error/500']);
                    return EMPTY;
                })
            )
            .subscribe(() => {
                this.navigateToSuccess();
                this.loading = false;
            });
    }

    private handleFormLoadSuccess(formRepresentation: FormRepresentation, staticFormValues: FormValues = {}): void {
        this.form = new FormModel(formRepresentation, staticFormValues);
        this.loading = false;
        this.notificationService.showSuccess('APP.PUBLIC_FORM.SUCCESS.LOADING_FORM');
    }

    private handleConstantValues(constants: Record<string, string>): void {
        this.showStartProcessButton = this.isStartButtonVisible(constants);
        this.showCancelButton = this.isCancelButtonVisible(constants);

        if (this.showStartProcessButton) {
            this.startProcessButtonLabel = constants['startLabel'] ?? this.startProcessButtonLabel;
        }
        if (this.showCancelButton) {
            this.cancelButtonLabel = constants['cancelLabel'] ?? this.cancelButtonLabel;
        }
    }

    private hasVisibleOutcomes(): boolean {
        return this.form.outcomes.some((outcome) => !outcome.isSystem);
    }

    private isStartButtonVisible(constants: Record<string, string>): boolean {
        if (this.hasVisibleOutcomes()) {
            return false;
        }

        return constants['startEnabled'] ? constants['startEnabled'] === 'true' : this.showStartProcessButton;
    }

    private isCancelButtonVisible(constants: Record<string, string>): boolean {
        return constants['cancelEnabled'] ? constants['cancelEnabled'] === 'true' : this.showCancelButton;
    }

    private navigateToSuccess(): void {
        void this.router.navigate(['./success'], {
            state: { outcome: this.outcome || 'submitted' },
            relativeTo: this.activatedRoute,
        });
    }
}
