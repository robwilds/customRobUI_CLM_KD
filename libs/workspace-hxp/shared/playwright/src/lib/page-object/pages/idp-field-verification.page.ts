/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    // uncomment as we need to use them
    // HxpIdpExtractionResultContainer,
    // FieldVerificationRootContainer,
    HxpIdpFieldVerificationHeaderComponent,
    HxpIdpFooterContainer,
    HxpIdpMetadataPanelComponent,
    HxpIdpRejectFieldDialog,
} from '../components/idp-field-verification-components';
import { TaskDetailsPage } from './task-details.page';

export class FieldVerificationPage extends TaskDetailsPage {
    fieldVerificationFooter = new HxpIdpFooterContainer(this.page);
    metadataPanel = new HxpIdpMetadataPanelComponent(this.page);
    rejectFieldDialog = new HxpIdpRejectFieldDialog(this.page);
    fieldVerificationHeader = new HxpIdpFieldVerificationHeaderComponent(this.page);
    // uncomment as we need to use them
    // extractionResult = new HxpIdpExtractionResultContainer(this.page);
    // fieldVerificationContainer = new FieldVerificationRootContainer(this.page);
}
