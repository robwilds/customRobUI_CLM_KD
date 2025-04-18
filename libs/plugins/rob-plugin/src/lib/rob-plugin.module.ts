import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslations } from '@alfresco/adf-core';
import { DashboardModule } from './pages/dashboard/dashboard.module'
import { provideExtensionConfigValues } from '@alfresco/adf-extensions'
import robPluginConfig from "../../configs/rob-plugin.extension.config.json";
import { KdsearchModule } from './pages/kdsearch/kdsearch.module'

@NgModule({
  imports: [CommonModule, TranslateModule, DashboardModule, KdsearchModule],
  providers: [provideTranslations('rob-plugin', 'assets/rob-plugin'), provideExtensionConfigValues([robPluginConfig])],
})
export class RobPluginModule {}
