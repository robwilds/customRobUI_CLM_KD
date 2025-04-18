/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeopleSmartComponent } from './people/people.smart-component';
import { GroupsSmartComponent } from './groups/groups.smart-component';
import { InitialGroupNamePipe } from './pipe/group-initial.pipe';
import { SharedIdentityFullNamePipe } from './pipe/full-name.pipe';
import { SHARED_IDENTITY_USER_SERVICE_TOKEN } from './services/identity-user-service.token';
import { IdentityUserService } from './services/identity-user.service';
import { SHARED_IDENTITY_GROUP_SERVICE_TOKEN } from './services/identity-group-service.token';
import { IdentityGroupService } from './services/identity-group.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideTranslations } from '@alfresco/adf-core';

@NgModule({
    imports: [
        CommonModule,
        MatChipsModule,
        MatTooltipModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        PeopleSmartComponent,
        GroupsSmartComponent,
        InitialGroupNamePipe,
        SharedIdentityFullNamePipe,
    ],
    exports: [PeopleSmartComponent, GroupsSmartComponent],
    providers: [
        provideTranslations('shared-identity', 'assets/shared-identity'),
        {
            provide: SHARED_IDENTITY_USER_SERVICE_TOKEN,
            useExisting: IdentityUserService,
        },
        {
            provide: SHARED_IDENTITY_GROUP_SERVICE_TOKEN,
            useExisting: IdentityGroupService,
        },
    ],
})
export class SharedIdentityModule {}
