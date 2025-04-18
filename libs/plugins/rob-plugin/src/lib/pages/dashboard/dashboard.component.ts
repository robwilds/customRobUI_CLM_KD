import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    template: `rob-plugin-dashboard Works! {{ 'PLUGIN_MESSAGE' | translate }}`,
    selector: 'rob-plugin-dashboard',
    imports: [TranslateModule],
    standalone: true,
})
export class DashboardComponent {
}
