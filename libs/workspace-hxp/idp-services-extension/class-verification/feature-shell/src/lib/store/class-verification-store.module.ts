/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { classVerificationStateName } from './states/root.state';
import { getClassVerificationRootReducer, metaReducers } from './reducers/class-verification-root.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ScreenEffects } from './effects/screen.effects';
import { DocumentEffects } from './effects/document.effects';

@NgModule({
    imports: [
        StoreModule.forFeature(classVerificationStateName, getClassVerificationRootReducer, { metaReducers }),
        EffectsModule.forFeature([ScreenEffects, DocumentEffects]),
    ],
})
export class ClassVerificationStoreModule {}
