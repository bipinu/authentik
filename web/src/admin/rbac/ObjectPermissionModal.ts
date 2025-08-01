import "#admin/rbac/ObjectPermissionsPage";
import "#elements/forms/ModalForm";

import { AKElement } from "#elements/Base";
import { ModelForm } from "#elements/forms/ModelForm";

import { RbacPermissionsAssignedByUsersListModelEnum } from "@goauthentik/api";

import { msg } from "@lit/localize";
import { CSSResult, html, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

/**
 * This is a bit of a hack to get the viewport checking from ModelForm,
 * even though we actually don't need a form here.
 * #TODO: Rework this in the future
 */
@customElement("ak-rbac-object-permission-modal-form")
export class ObjectPermissionsPageForm extends ModelForm<unknown, string> {
    @property()
    model?: RbacPermissionsAssignedByUsersListModelEnum;

    @property()
    objectPk?: string | number;

    loadInstance(): Promise<unknown> {
        return Promise.resolve();
    }
    send(): Promise<unknown> {
        return Promise.resolve();
    }

    renderForm(): TemplateResult {
        return html`<ak-rbac-object-permission-page
            .model=${this.model}
            .objectPk=${this.objectPk}
            slot="form"
        >
        </ak-rbac-object-permission-page>`;
    }
}

@customElement("ak-rbac-object-permission-modal")
export class ObjectPermissionModal extends AKElement {
    @property()
    model?: RbacPermissionsAssignedByUsersListModelEnum;

    @property()
    objectPk?: string | number;

    static styles: CSSResult[] = [PFBase, PFButton];

    render(): TemplateResult {
        return html`
            <ak-forms-modal .showSubmitButton=${false} cancelText=${msg("Close")}>
                <span slot="header"> ${msg("Update Permissions")} </span>
                <ak-rbac-object-permission-modal-form
                    slot="form"
                    .model=${this.model}
                    .objectPk=${this.objectPk}
                ></ak-rbac-object-permission-modal-form>
                <button slot="trigger" class="pf-c-button pf-m-plain">
                    <pf-tooltip position="top" content=${msg("Permissions")}>
                        <i class="fas fa-lock"></i>
                    </pf-tooltip>
                </button>
            </ak-forms-modal>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-rbac-object-permission-modal-form": ObjectPermissionsPageForm;
        "ak-rbac-object-permission-modal": ObjectPermissionModal;
    }
}
