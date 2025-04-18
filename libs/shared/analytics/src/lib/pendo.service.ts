/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AppConfigService, AuthenticationService } from '@alfresco/adf-core';
import { switchMap, take } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { WordArray } from 'crypto-es/lib/core';
import { SHA256 } from 'crypto-es/lib/sha256';

/* eslint-disable prefer-const */

export interface PendoWindow extends Window {
    pendo: any;
}

const sanitizePaths = ['search'];

@Injectable({
    providedIn: 'root',
})
export class PendoService {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly appConfigService: AppConfigService,
        @Inject(DOCUMENT) private readonly document: Document
    ) {
        this.appConfigService
            .select('analytics')
            .pipe(
                switchMap((pendoEnabled) => {
                    const isPendoEnabled = this.isPendoEnabled(pendoEnabled);
                    if (isPendoEnabled) {
                        this.injectPendoJS();
                    }
                    return forkJoin({
                        loginPipe: this.authenticationService.onLogin.pipe(take(1)),
                        isPendoEnabled: of(isPendoEnabled),
                    });
                })
            )
            .subscribe((login) => {
                if (login.isPendoEnabled) {
                    const username = authenticationService.getEcmUsername() || authenticationService.getBpmUsername();
                    const hiddenUserName = this.hideUserName(username);
                    const accountId = this.getAccountId();
                    const disableGuides = this.appConfigService.get<string>('analytics.pendo.disableGuides') === 'true';
                    const excludeAllText = this.appConfigService.get<string>('analytics.pendo.excludeAllText') === 'true';

                    const window = this.document.defaultView as unknown as PendoWindow;
                    const pendo = window?.pendo;

                    if (window && pendo) {
                        pendo.initialize({
                            sanitizeUrl: (url: string) => this.sanitize(url, sanitizePaths),

                            visitor: {
                                id: hiddenUserName,
                            },
                            account: {
                                id: accountId,
                                host: window.location.hostname,
                            },
                            disableGuides: disableGuides,
                            excludeAllText: excludeAllText,
                        });
                    }
                }
            });
    }

    getAccountId() {
        const titleAppKebabCase = this.appConfigService.get<string>('application.name')?.replace(/\s+/g, '-').toLowerCase();

        const customerName = this.appConfigService.get<boolean>('customer.name');
        return customerName || titleAppKebabCase;
    }

    isPendoEnabled(pendoEnabled: any) {
        return pendoEnabled?.pendo?.enabled === 'true';
    }

    hideUserName(username: string | WordArray) {
        return SHA256(username).toString();
    }

    sanitize(url: string, paths: string[]): string {
        let sanitizeUrl = url;
        const index = url.indexOf('?');
        if (index > -1) {
            sanitizeUrl = url.slice(0, index);
        }
        paths.forEach((searchKey) => {
            const searchIndex = url.indexOf(searchKey);
            if (searchIndex > -1) {
                sanitizeUrl = url.slice(0, searchIndex + searchKey.length);
            }
        });
        return sanitizeUrl;
    }

    injectPendoJS() {
        const window = this.document.defaultView as unknown as PendoWindow;
        const analyticsKey = this.appConfigService.get<string>('analytics.pendo.key');

        ((apiKey: string) => {
            (function (p, e, o) {
                let v: string[], w, x, y, z;
                o = p['pendo'] = p['pendo'] || {};
                o._q = o._q || [];
                v = ['initialize', 'identify', 'updateOptions', 'pageLoad', 'track'];
                for (w = 0, x = v.length; w < x; ++w) {
                    (function (m) {
                        o[m] =
                            o[m] ||
                            function () {
                                // eslint-disable-next-line prefer-rest-params
                                o._q[m === v[0] ? 'unshift' : 'push']([m].concat([].slice.call(arguments, 0)));
                            };
                    })(v[w]);
                }
                y = e.createElement('script');
                y.async = !0;
                y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js';
                z = e.getElementsByTagName('script')[0];
                z.parentNode?.insertBefore(y, z);
            })(window, document, window.pendo);
        }).bind(this)(analyticsKey);
    }
}
