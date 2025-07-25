import FlowSearch from "./FlowSearch.js";

import type { Flow } from "@goauthentik/api";

import { customElement, property } from "lit/decorators.js";

/**
 * Search for flows that may have a fallback specified by the brand settings
 *
 * @element ak-branded-flow-search
 *
 */

@customElement("ak-branded-flow-search")
export class AkBrandedFlowSearch<T extends Flow> extends FlowSearch<T> {
    /**
     * The Associated ID of the flow the brand has, to compare if possible
     *
     * @attr
     */
    @property({ attribute: false, type: String })
    brandFlow?: string;

    constructor() {
        super();
        this.selected = this.selected.bind(this);
    }

    selected(flow: Flow): boolean {
        return super.selected(flow) || flow.pk === this.brandFlow;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-branded-flow-search": AkBrandedFlowSearch<Flow>;
    }
}

export default AkBrandedFlowSearch;
