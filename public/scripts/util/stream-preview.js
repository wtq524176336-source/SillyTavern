/**
 * Creates a state bag for incremental streaming previews.
 * @returns {{ text: string, textNode: Text|null, blockNodes: HTMLParagraphElement[], blockTexts: string[] }}
 */
export function createStreamingPreviewState() {
    return {
        text: '',
        textNode: null,
        blockNodes: [],
        blockTexts: [],
    };
}

/**
 * Splits plain streaming text into paragraph-like blocks matching Markdown's blank-line behavior.
 * @param {string} text Streaming text
 * @returns {string[]} Non-empty text blocks
 */
function splitStreamingPreviewBlocks(text) {
    return text.split(/\n{2,}/).filter(block => block.length > 0);
}

/**
 * Creates a paragraph node for a plain-text streaming preview block.
 * @param {string} text Paragraph text
 * @returns {HTMLParagraphElement}
 */
function createStreamingPreviewBlock(text) {
    const paragraph = document.createElement('p');
    updateStreamingPreviewBlock(paragraph, text);
    return paragraph;
}

/**
 * Updates a paragraph node while matching Markdown's simple line break output.
 * @param {HTMLParagraphElement} paragraph Paragraph node
 * @param {string} text Paragraph text
 * @returns {void}
 */
function updateStreamingPreviewBlock(paragraph, text) {
    const lines = text.split('\n');
    const fragment = document.createDocumentFragment();

    for (const [index, line] of lines.entries()) {
        if (index > 0) {
            fragment.append(document.createElement('br'));
        }

        if (line) {
            fragment.append(document.createTextNode(line));
        }
    }

    paragraph.replaceChildren(fragment);
}

/**
 * Checks whether the target element still contains the preview nodes tracked in state.
 * @param {HTMLElement} element Target element
 * @param {{ blockNodes?: HTMLParagraphElement[] }} state Mutable preview state
 * @returns {boolean} True if the existing preview nodes can be updated in place
 */
function hasValidStreamingPreviewBlocks(element, state) {
    return Array.isArray(state.blockNodes) &&
        element.childNodes.length === state.blockNodes.length &&
        state.blockNodes.every((node, index) => node.parentNode === element && element.childNodes[index] === node);
}

/**
 * Renders a lightweight text-only preview for streaming updates.
 * Uses paragraph blocks so blank lines keep the same spacing as formatted Markdown.
 *
 * @param {HTMLElement|null|undefined} element Target element
 * @param {string} nextText Full preview text to display
 * @param {{ text: string, textNode: Text|null, blockNodes?: HTMLParagraphElement[], blockTexts?: string[] }} state Mutable preview state
 * @param {string} [className='streaming-preview'] Preview CSS class
 * @returns {void}
 */
export function renderStreamingPreview(element, nextText, state, className = 'streaming-preview') {
    if (!(element instanceof HTMLElement)) {
        return;
    }

    element.classList.add(className);

    const blocks = splitStreamingPreviewBlocks(nextText);
    state.textNode = null;
    if (!Array.isArray(state.blockTexts)) {
        state.blockTexts = [];
    }

    if (!hasValidStreamingPreviewBlocks(element, state)) {
        state.blockNodes = blocks.map(createStreamingPreviewBlock);
        state.blockTexts = blocks.slice();
        const fragment = document.createDocumentFragment();
        for (const node of state.blockNodes) {
            fragment.append(node);
        }
        element.replaceChildren(fragment);
        state.text = '';
    }

    while (state.blockNodes.length > blocks.length) {
        state.blockNodes.pop().remove();
        state.blockTexts.pop();
    }

    for (let index = 0; index < blocks.length; index++) {
        const block = blocks[index];
        let paragraph = state.blockNodes[index];

        if (!(paragraph instanceof HTMLParagraphElement)) {
            paragraph = createStreamingPreviewBlock(block);
            state.blockNodes[index] = paragraph;
            state.blockTexts[index] = block;
            element.append(paragraph);
            continue;
        }

        if (state.blockTexts[index] !== block) {
            updateStreamingPreviewBlock(paragraph, block);
            state.blockTexts[index] = block;
        }
    }

    state.text = nextText;
}

/**
 * Clears streaming preview bookkeeping and removes preview styling.
 * @param {HTMLElement|null|undefined} element Target element
 * @param {{ text: string, textNode: Text|null, blockNodes?: HTMLParagraphElement[], blockTexts?: string[] }} state Mutable preview state
 * @param {string} [className='streaming-preview'] Preview CSS class
 * @returns {void}
 */
export function resetStreamingPreview(element, state, className = 'streaming-preview') {
    if (element instanceof HTMLElement) {
        element.classList.remove(className);
    }

    state.text = '';
    state.textNode = null;
    state.blockNodes = [];
    state.blockTexts = [];
}
