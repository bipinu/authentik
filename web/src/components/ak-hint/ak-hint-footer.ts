import { AKElement } from "#elements/Base";

import { css, html } from "lit";
import { customElement } from "lit/decorators.js";

const style = css`
    #host {
        grid-column: 1 / -1;
    }
    ::slotted(div#host > *:not(:last-child)) {
        margin-right: var(--ak-hint__footer--child--MarginRight);
    }
`;

@customElement("ak-hint-footer")
export class AkHintFooter extends AKElement {
    static styles = [style];

    render() {
        return html`<div id="host" part="ak-hint-footer"><slot></slot></div>`;
    }
}

export default AkHintFooter;

declare global {
    interface HTMLElementTagNameMap {
        "ak-hint-footer": AkHintFooter;
    }
}
