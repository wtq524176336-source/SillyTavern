/**
 * Creates a state bag for incremental streaming previews.
 * @returns {{ text: string, textNode: Text|null }}
 */
export function createStreamingPreviewState() {
    return {
        text: '',
        textNode: null,
    };
}

/**
 * Renders a lightweight text-only preview for streaming updates.
 * Falls back to replacing the full preview when the new text is not a simple append.
 *
 * @param {HTMLElement|null|undefined} element Target element
 * @param {string} nextText Full preview text to display
 * @param {{ text: string, textNode: Text|null }} state Mutable preview state
 * @param {string} [className='streaming-preview'] Preview CSS class
 * @returns {void}
 */
export function renderStreamingPreview(element, nextText, state, className = 'streaming-preview') {
    if (!(element instanceof HTMLElement)) {
        return;
    }

    element.classList.add(className);

    const mustResetNode =
        !(state.textNode instanceof Text) ||
        state.textNode.parentNode !== element ||
        element.childNodes.length !== 1 ||
        element.firstChild !== state.textNode;

    if (mustResetNode) {
        state.textNode = document.createTextNode('');
        element.replaceChildren(state.textNode);
        state.text = '';
    }

    const previousText = state.text;
    const previousLength = previousText.length;
    const nextLength = nextText.length;

    let prefixLength = 0;
    const commonPrefixLimit = Math.min(previousLength, nextLength);
    while (prefixLength < commonPrefixLimit && previousText[prefixLength] === nextText[prefixLength]) {
        prefixLength++;
    }

    let suffixLength = 0;
    const commonSuffixLimit = Math.min(previousLength - prefixLength, nextLength - prefixLength);
    while (
        suffixLength < commonSuffixLimit &&
        previousText[previousLength - suffixLength - 1] === nextText[nextLength - suffixLength - 1]
    ) {
        suffixLength++;
    }

    const replaceStart = prefixLength;
    const replaceCount = previousLength - prefixLength - suffixLength;
    const replacement = nextText.slice(prefixLength, nextLength - suffixLength);

    if (replaceStart === previousLength && replacement.length > 0) {
        state.textNode.appendData(replacement);
    } else if (replaceCount > 0 || replacement.length > 0) {
        state.textNode.replaceData(replaceStart, replaceCount, replacement);
    }

    state.text = nextText;
}

/**
 * Clears streaming preview bookkeeping and removes preview styling.
 * @param {HTMLElement|null|undefined} element Target element
 * @param {{ text: string, textNode: Text|null }} state Mutable preview state
 * @param {string} [className='streaming-preview'] Preview CSS class
 * @returns {void}
 */
export function resetStreamingPreview(element, state, className = 'streaming-preview') {
    if (element instanceof HTMLElement) {
        element.classList.remove(className);
    }

    state.text = '';
    state.textNode = null;
}
