import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    template: `rob-plugin-kdsearch Works! {{ 'PLUGIN_MESSAGE' | translate }}`,
    selector: 'rob-plugin-kdsearch',
    imports: [TranslateModule],
    standalone: true,
})
export class KdsearchComponent {
}
