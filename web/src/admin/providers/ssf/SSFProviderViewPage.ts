import "#admin/providers/RelatedApplicationButton";
import "#admin/providers/ssf/SSFProviderFormPage";
import "#admin/providers/ssf/StreamTable";
import "#components/events/ObjectChangelog";
import "#elements/CodeMirror";
import "#elements/EmptyState";
import "#elements/Tabs";
import "#elements/buttons/ModalButton";
import "#elements/buttons/SpinnerButton/index";
import "#elements/tasks/TaskList";

import { DEFAULT_CONFIG } from "#common/api/config";
import { EVENT_REFRESH } from "#common/constants";

import { AKElement } from "#elements/Base";

import {
    ModelEnum,
    ProvidersApi,
    RbacPermissionsAssignedByUsersListModelEnum,
    SSFProvider,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import PFBanner from "@patternfly/patternfly/components/Banner/banner.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFCard from "@patternfly/patternfly/components/Card/card.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";
import PFDescriptionList from "@patternfly/patternfly/components/DescriptionList/description-list.css";
import PFDivider from "@patternfly/patternfly/components/Divider/divider.css";
import PFForm from "@patternfly/patternfly/components/Form/form.css";
import PFFormControl from "@patternfly/patternfly/components/FormControl/form-control.css";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFGrid from "@patternfly/patternfly/layouts/Grid/grid.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

@customElement("ak-provider-ssf-view")
export class SSFProviderViewPage extends AKElement {
    @property({ type: Number })
    set providerID(value: number) {
        new ProvidersApi(DEFAULT_CONFIG)
            .providersSsfRetrieve({
                id: value,
            })
            .then((prov) => {
                this.provider = prov;
            });
    }

    @property({ attribute: false })
    provider?: SSFProvider;

    static styles: CSSResult[] = [
        PFBase,
        PFButton,
        PFPage,
        PFGrid,
        PFContent,
        PFCard,
        PFDescriptionList,
        PFForm,
        PFFormControl,
        PFBanner,
        PFDivider,
    ];

    constructor() {
        super();
        this.addEventListener(EVENT_REFRESH, () => {
            if (!this.provider?.pk) return;
            this.providerID = this.provider?.pk;
        });
    }

    render(): TemplateResult {
        if (!this.provider) {
            return html``;
        }
        return html` <ak-tabs>
            <section slot="page-overview" data-tab-title="${msg("Overview")}">
                ${this.renderTabOverview()}
            </section>
            <section
                slot="page-changelog"
                data-tab-title="${msg("Changelog")}"
                class="pf-c-page__main-section pf-m-no-padding-mobile"
            >
                <div class="pf-c-card">
                    <div class="pf-c-card__body">
                        <ak-object-changelog
                            targetModelPk=${this.provider?.pk || ""}
                            targetModelName=${this.provider?.metaModelName || ""}
                        >
                        </ak-object-changelog>
                    </div>
                </div>
            </section>
            <ak-rbac-object-permission-page
                slot="page-permissions"
                data-tab-title="${msg("Permissions")}"
                model=${RbacPermissionsAssignedByUsersListModelEnum.AuthentikProvidersSsfSsfprovider}
                objectPk=${this.provider.pk}
            ></ak-rbac-object-permission-page>
        </ak-tabs>`;
    }

    renderTabOverview(): TemplateResult {
        if (!this.provider) {
            return html``;
        }
        const [appLabel, modelName] = ModelEnum.AuthentikProvidersSsfSsfprovider.split(".");
        return html`<div slot="header" class="pf-c-banner pf-m-info">
                ${msg("SSF Provider is in preview.")}
                <a href="mailto:hello+feature/ssf@goauthentik.io">${msg("Send us feedback!")}</a>
            </div>
            <div class="pf-c-page__main-section pf-m-no-padding-mobile pf-l-grid pf-m-gutter">
                <div
                    class="pf-c-card pf-l-grid__item pf-m-12-col pf-m-4-col-on-xl pf-m-4-col-on-2xl"
                >
                    <div class="pf-c-card__body">
                        <dl class="pf-c-description-list">
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text">${msg("Name")}</span>
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        ${this.provider.name}
                                    </div>
                                </dd>
                            </div>
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text">${msg("URL")}</span>
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        <input
                                            class="pf-c-form-control pf-m-monospace"
                                            readonly
                                            type="text"
                                            value=${this.provider.ssfUrl || ""}
                                            placeholder=${this.provider.ssfUrl
                                                ? msg("SSF URL")
                                                : msg("No assigned application")}
                                        />
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div class="pf-c-card__footer">
                        <ak-forms-modal>
                            <span slot="submit"> ${msg("Update")} </span>
                            <span slot="header"> ${msg("Update SSF Provider")} </span>
                            <ak-provider-ssf-form slot="form" .instancePk=${this.provider.pk || 0}>
                            </ak-provider-ssf-form>
                            <button slot="trigger" class="pf-c-button pf-m-primary">
                                ${msg("Edit")}
                            </button>
                        </ak-forms-modal>
                    </div>
                </div>
                <div class="pf-c-card pf-l-grid__item pf-m-8-col-on-2xl">
                    <div class="pf-c-card__title">${msg("Streams")}</div>
                    <ak-provider-ssf-stream-list .providerId=${this.providerID}>
                    </ak-provider-ssf-stream-list>
                </div>
                <div class="pf-c-card pf-l-grid__item pf-m-12-col-on-2xl">
                    <div class="pf-c-card__title">${msg("Tasks")}</div>
                    <ak-task-list
                        .relObjAppLabel=${appLabel}
                        .relObjModel=${modelName}
                        .relObjId="${this.provider.pk}"
                    ></ak-task-list>
                </div>
            </div>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-provider-ssf-view": SSFProviderViewPage;
    }
}
