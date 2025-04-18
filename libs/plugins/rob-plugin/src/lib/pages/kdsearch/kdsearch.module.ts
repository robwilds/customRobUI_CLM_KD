import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExtensionService } from '@alfresco/adf-extensions';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { KdsearchComponent } from './kdsearch.component';
import { KdsearchMenuItemComponent } from './kdsearch-menu-item.component';

@NgModule({
    imports: [
        RouterModule.forChild([]),
        MatButtonModule,
        TranslateModule,
        KdsearchComponent,
        KdsearchMenuItemComponent,
    ],
})
export class KdsearchModule {
    constructor(extensionService: ExtensionService) {
        extensionService.setComponents({
            'page-component-39bc0288-a971-44bc-a2b4-035c6e84cd4d': KdsearchComponent,
            'page-menu-item-da21127b-eefe-4043-9bc7-b7c81fbd802b': KdsearchMenuItemComponent,
        });
    }
}
