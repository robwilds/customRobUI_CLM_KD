import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExtensionService } from '@alfresco/adf-extensions';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardComponent } from './dashboard.component';
import { DashboardMenuItemComponent } from './dashboard-menu-item.component';

@NgModule({
    imports: [
        RouterModule.forChild([]),
        MatButtonModule,
        TranslateModule,
        DashboardComponent,
        DashboardMenuItemComponent,
    ],
})
export class DashboardModule {
    constructor(extensionService: ExtensionService) {
        extensionService.setComponents({
            'page-component-964184ac-ff71-46a3-b007-8202b4400a34': DashboardComponent,
            'page-menu-item-7b4564c4-9e72-47f1-9a27-e250dde1aed1': DashboardMenuItemComponent,
        });
    }
}
