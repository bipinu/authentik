import "#admin/stages/prompt/PromptForm";
import "#elements/ak-dual-select/ak-dual-select-dynamic-selected-provider";
import "#elements/forms/FormGroup";
import "#elements/forms/HorizontalFormElement";
import "#elements/forms/ModalForm";

import {
    policiesProvider,
    policiesSelector,
    promptFieldsProvider,
    promptFieldsSelector,
} from "./PromptStageFormHelpers.js";

import { DEFAULT_CONFIG } from "#common/api/config";
import { PFSize } from "#common/enums";

import { BaseStageForm } from "#admin/stages/BaseStageForm";

import { PromptStage, StagesApi } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { html, nothing, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("ak-stage-prompt-form")
export class PromptStageForm extends BaseStageForm<PromptStage> {
    loadInstance(pk: string): Promise<PromptStage> {
        return new StagesApi(DEFAULT_CONFIG).stagesPromptStagesRetrieve({
            stageUuid: pk,
        });
    }

    async send(data: PromptStage): Promise<PromptStage> {
        if (this.instance) {
            return new StagesApi(DEFAULT_CONFIG).stagesPromptStagesUpdate({
                stageUuid: this.instance.pk || "",
                promptStageRequest: data,
            });
        }
        return new StagesApi(DEFAULT_CONFIG).stagesPromptStagesCreate({
            promptStageRequest: data,
        });
    }

    renderForm(): TemplateResult {
        return html` <span>
                ${msg(
                    "Show arbitrary input fields to the user, for example during enrollment. Data is saved in the flow context under the 'prompt_data' variable.",
                )}
            </span>
            <ak-form-element-horizontal label=${msg("Name")} required name="name">
                <input
                    type="text"
                    value="${ifDefined(this.instance?.name || "")}"
                    class="pf-c-form-control"
                    required
                />
            </ak-form-element-horizontal>
            <ak-form-group open label="${msg("Stage-specific settings")}">
                <div class="pf-c-form">
                    <ak-form-element-horizontal label=${msg("Fields")} required name="fields">
                        <ak-dual-select-dynamic-selected
                            .provider=${promptFieldsProvider}
                            .selector=${promptFieldsSelector(this.instance?.fields)}
                            available-label="${msg("Available Fields")}"
                            selected-label="${msg("Selected Fields")}"
                        ></ak-dual-select-dynamic-selected>
                        ${this.instance
                            ? html`<ak-forms-modal size=${PFSize.XLarge}>
                                  <span slot="submit"> ${msg("Create")} </span>
                                  <span slot="header"> ${msg("Create Prompt")} </span>
                                  <ak-prompt-form slot="form"> </ak-prompt-form>
                                  <button
                                      type="button"
                                      slot="trigger"
                                      class="pf-c-button pf-m-primary"
                                  >
                                      ${msg("Create")}
                                  </button>
                              </ak-forms-modal>`
                            : nothing}
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${msg("Validation Policies")}
                        name="validationPolicies"
                    >
                        <ak-dual-select-dynamic-selected
                            .provider=${policiesProvider}
                            .selector=${policiesSelector(this.instance?.validationPolicies)}
                            available-label="${msg("Available Policies")}"
                            selected-label="${msg("Selected Policies")}"
                        ></ak-dual-select-dynamic-selected>
                        <p class="pf-c-form__helper-text">
                            ${msg(
                                "Selected policies are executed when the stage is submitted to validate the data.",
                            )}
                        </p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-prompt-form": PromptStageForm;
    }
}
