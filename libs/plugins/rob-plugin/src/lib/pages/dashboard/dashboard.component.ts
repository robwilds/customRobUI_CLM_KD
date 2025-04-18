import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  templateUrl: './dashboard.Component.html',
  selector: 'rob-plugin-dashboard',
  imports: [TranslateModule],
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent {}
