import "#components/ak-hidden-text-input";
import "#elements/ak-dual-select/ak-dual-select-dynamic-selected-provider";
import "#elements/ak-dual-select/ak-dual-select-provider";
import "#elements/forms/FormGroup";
import "#elements/forms/HorizontalFormElement";
import "#elements/forms/Radio";
import "#elements/forms/SearchSelect/index";

import { DEFAULT_CONFIG } from "#common/api/config";

import { BaseProviderForm } from "#admin/providers/BaseProviderForm";
import {
    propertyMappingsProvider,
    propertyMappingsSelector,
} from "#admin/providers/microsoft_entra/MicrosoftEntraProviderFormHelpers";

import {
    CoreApi,
    CoreGroupsListRequest,
    Group,
    MicrosoftEntraProvider,
    OutgoingSyncDeleteAction,
    ProvidersApi,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("ak-provider-microsoft-entra-form")
export class MicrosoftEntraProviderFormPage extends BaseProviderForm<MicrosoftEntraProvider> {
    loadInstance(pk: number): Promise<MicrosoftEntraProvider> {
        return new ProvidersApi(DEFAULT_CONFIG).providersMicrosoftEntraRetrieve({
            id: pk,
        });
    }

    async send(data: MicrosoftEntraProvider): Promise<MicrosoftEntraProvider> {
        if (this.instance) {
            return new ProvidersApi(DEFAULT_CONFIG).providersMicrosoftEntraUpdate({
                id: this.instance.pk,
                microsoftEntraProviderRequest: data,
            });
        }
        return new ProvidersApi(DEFAULT_CONFIG).providersMicrosoftEntraCreate({
            microsoftEntraProviderRequest: data,
        });
    }

    renderForm(): TemplateResult {
        return html` <ak-form-element-horizontal label=${msg("Name")} required name="name">
                <input
                    type="text"
                    value="${ifDefined(this.instance?.name)}"
                    class="pf-c-form-control"
                    required
                />
            </ak-form-element-horizontal>
            <ak-form-group open label="${msg("Protocol settings")}">
                <div class="pf-c-form">
                    <ak-form-element-horizontal label=${msg("Client ID")} required name="clientId">
                        <input
                            type="text"
                            value="${this.instance?.clientId ?? ""}"
                            class="pf-c-form-control pf-m-monospace"
                            required
                        />
                        <p class="pf-c-form__helper-text">
                            ${msg("Client ID for the app registration.")}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-hidden-text-input
                        name="clientSecret"
                        label=${msg("Client Secret")}
                        autocomplete="off"
                        value="${this.instance?.clientSecret ?? ""}"
                        input-hint="code"
                        required
                        .help=${msg("Client secret for the app registration.")}
                    >
                    </ak-hidden-text-input>
                    <ak-form-element-horizontal label=${msg("Tenant ID")} required name="tenantId">
                        <input
                            type="text"
                            value="${this.instance?.tenantId ?? ""}"
                            class="pf-c-form-control pf-m-monospace"
                            required
                        />
                        <p class="pf-c-form__helper-text">
                            ${msg("ID of the tenant accounts will be synced into.")}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-radio-input
                        name="userDeleteAction"
                        label=${msg("User deletion action")}
                        required
                        .options=${[
                            {
                                label: msg("Delete"),
                                value: OutgoingSyncDeleteAction.Delete,
                                default: true,
                                description: html`${msg("User is deleted")}`,
                            },
                            {
                                label: msg("Do Nothing"),
                                value: OutgoingSyncDeleteAction.DoNothing,
                                description: html`${msg(
                                    "The connection is removed but the user is not modified",
                                )}`,
                            },
                        ]}
                        .value=${this.instance?.userDeleteAction}
                        help=${msg("Determines what authentik will do when a User is deleted.")}
                    >
                    </ak-radio-input>
                    <ak-radio-input
                        name="groupDeleteAction"
                        label=${msg("Group deletion action")}
                        required
                        .options=${[
                            {
                                label: msg("Delete"),
                                value: OutgoingSyncDeleteAction.Delete,
                                default: true,
                                description: html`${msg("Group is deleted")}`,
                            },
                            {
                                label: msg("Do Nothing"),
                                value: OutgoingSyncDeleteAction.DoNothing,
                                description: html`${msg(
                                    "The connection is removed but the group is not modified",
                                )}`,
                            },
                        ]}
                        .value=${this.instance?.groupDeleteAction}
                        help=${msg("Determines what authentik will do when a Group is deleted.")}
                    >
                    </ak-radio-input>
                    <ak-form-element-horizontal name="dryRun">
                        <label class="pf-c-switch">
                            <input
                                class="pf-c-switch__input"
                                type="checkbox"
                                ?checked=${this.instance?.dryRun ?? false}
                            />
                            <span class="pf-c-switch__toggle">
                                <span class="pf-c-switch__toggle-icon">
                                    <i class="fas fa-check" aria-hidden="true"></i>
                                </span>
                            </span>
                            <span class="pf-c-switch__label">${msg("Enable dry-run mode")}</span>
                        </label>
                        <p class="pf-c-form__helper-text">
                            ${msg(
                                "When enabled, mutating requests will be dropped and logged instead.",
                            )}
                        </p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
            <ak-form-group open label="${msg("User filtering")}">
                <div class="pf-c-form">
                    <ak-form-element-horizontal name="excludeUsersServiceAccount">
                        <label class="pf-c-switch">
                            <input
                                class="pf-c-switch__input"
                                type="checkbox"
                                ?checked=${this.instance?.excludeUsersServiceAccount ?? true}
                            />
                            <span class="pf-c-switch__toggle">
                                <span class="pf-c-switch__toggle-icon">
                                    <i class="fas fa-check" aria-hidden="true"></i>
                                </span>
                            </span>
                            <span class="pf-c-switch__label"
                                >${msg("Exclude service accounts")}</span
                            >
                        </label>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal label=${msg("Group")} name="filterGroup">
                        <ak-search-select
                            .fetchObjects=${async (query?: string): Promise<Group[]> => {
                                const args: CoreGroupsListRequest = {
                                    ordering: "name",
                                    includeUsers: false,
                                };
                                if (query !== undefined) {
                                    args.search = query;
                                }
                                const groups = await new CoreApi(DEFAULT_CONFIG).coreGroupsList(
                                    args,
                                );
                                return groups.results;
                            }}
                            .renderElement=${(group: Group): string => {
                                return group.name;
                            }}
                            .value=${(group: Group | undefined): string | undefined => {
                                return group ? group.pk : undefined;
                            }}
                            .selected=${(group: Group): boolean => {
                                return group.pk === this.instance?.filterGroup;
                            }}
                            blankable
                        >
                        </ak-search-select>
                        <p class="pf-c-form__helper-text">
                            ${msg("Only sync users within the selected group.")}
                        </p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
            <ak-form-group open label="${msg("Attribute mapping")}">
                <div class="pf-c-form">
                    <ak-form-element-horizontal
                        label=${msg("User Property Mappings")}
                        name="propertyMappings"
                    >
                        <ak-dual-select-dynamic-selected
                            .provider=${propertyMappingsProvider}
                            .selector=${propertyMappingsSelector(
                                this.instance?.propertyMappings,
                                "goauthentik.io/providers/microsoft_entra/user",
                            )}
                            available-label=${msg("Available Property Mappings")}
                            selected-label=${msg("Selected Property Mappings")}
                        ></ak-dual-select-dynamic-selected>
                        <p class="pf-c-form__helper-text">
                            ${msg("Property mappings used to user mapping.")}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${msg("Group Property Mappings")}
                        name="propertyMappingsGroup"
                    >
                        <ak-dual-select-dynamic-selected
                            .provider=${propertyMappingsProvider}
                            .selector=${propertyMappingsSelector(
                                this.instance?.propertyMappingsGroup,
                                "goauthentik.io/providers/microsoft_entra/group",
                            )}
                            available-label=${msg("Available Property Mappings")}
                            selected-label=${msg("Selected Property Mappings")}
                        ></ak-dual-select-dynamic-selected>
                        <p class="pf-c-form__helper-text">
                            ${msg("Property mappings used to group creation.")}
                        </p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-provider-microsoft-entra-form": MicrosoftEntraProviderFormPage;
    }
}
