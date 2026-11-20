import { SHRINK, breakLines } from './breakLines';

/**
 * Justified paragraphs with line breaks chosen for the whole paragraph (see breakLines.ts), applied
 * without touching the markup: links, emphasis and code stay as they are.
 *
 * Words are measured as the browser renders them. Measuring with canvas (what Pretext does) is
 * unreliable for system fonts like SF Pro, which this site uses. Once the breaks are chosen, every
 * space inside a line becomes a no-break space and every space at a line's end stays breakable, so
 * the browser can only break where the algorithm did, and its own `text-align: justify` spreads each
 * line. A word broken across lines gets a soft hyphen at that point.
 *
 * The CSS fallback, until this runs or where it gives up, is plain `text-align: justify` with the
 * browser's own hyphenation.
 */

type Hyphenate = (word: string) => string;
type Segment = { node: Text; start: number; end: number };
type Char = { node: Text; offset: number };
type Separator = { kind: 'space'; run: Char[] } | { kind: 'hyphen'; at: Char };

type Plan = {
  element: HTMLElement;
  pieces: Segment[][];
  separators: Separator[];
  breaks: number[];
  space: number;
};

const NBSP = ' ';
const SHY = '­';
/** Words worth hyphenating: letters, maybe an apostrophe or hyphen, maybe trailing punctuation. */
const HYPHENATABLE = /^[\p{L}’'-]{6,}[\p{P}]*$/u;

/** Text as written, before any no-break spaces or soft hyphens went in. */
const original = new WeakMap<Text, string>();
/** What each element looked like when last justified, to skip work when nothing changed. */
const done = new WeakMap<HTMLElement, { width: number; text: string }>();

/** Justifies these elements; ones that haven't changed since last time are skipped. */
export function justify(elements: HTMLElement[], hyphenate: Hyphenate) {
  const todo = elements.filter((element) => {
    const last = done.get(element);
    return !last || last.width !== element.clientWidth || last.text !== element.textContent;
  });

  // Read everything, then write everything, then check: one layout for the batch, not one each.
  todo.forEach(restore);
  for (const element of todo) element.dataset.justify = 'on';
  const plans = todo.flatMap((element) => plan(element, hyphenate) ?? []);
  plans.forEach(apply);

  for (const element of todo) {
    const current = plans.find((p) => p.element === element);
    if (!current || !matches(current)) {
      restore(element);
      delete element.dataset.justify;
    }
    done.set(element, { width: element.clientWidth, text: element.textContent ?? '' });
  }
}

function textNodes(element: HTMLElement) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
  return nodes;
}

function restore(element: HTMLElement) {
  element.style.wordSpacing = '';
  for (const node of textNodes(element)) {
    const text = original.get(node);
    if (text !== undefined && node.data !== text) node.data = text;
  }
}

/** Only plain runs of text: anything laid out as a block, an image or a line break is left alone. */
function isPlainText(element: HTMLElement) {
  return Array.from(element.querySelectorAll('*')).every((child) => getComputedStyle(child).display === 'inline');
}

function plan(element: HTMLElement, hyphenate: Hyphenate): Plan | undefined {
  if (!isPlainText(element)) return undefined;

  // Words (as segments of text nodes, since a word can span `<em>` and the comma after it) and the
  // whitespace between them.
  const words: Segment[][] = [];
  const runs: Char[][] = [];
  let word: Segment[] = [];
  let run: Char[] = [];
  for (const node of textNodes(element)) {
    for (let i = 0; i < node.data.length; i++) {
      const char = node.data[i];
      if (char !== NBSP && /\s/.test(char)) {
        if (word.length) words.push(word);
        word = [];
        run.push({ node, offset: i });
      } else {
        if (run.length && words.length && !word.length) runs.push(run);
        if (!word.length) run = [];
        const last = word.at(-1);
        if (last?.node === node && last.end === i) last.end++;
        else word.push({ node, start: i, end: i + 1 });
      }
    }
  }
  if (word.length) words.push(word);
  if (words.length < 4) return undefined;

  // Pieces: whole words, or the parts of a word between its hyphenation points.
  const pieces: Segment[][] = [];
  const separators: Separator[] = [];
  words.forEach((segments, w) => {
    const [only] = segments;
    const text = only.node.data.slice(only.start, only.end);
    const points =
      segments.length === 1 && HYPHENATABLE.test(text) && !only.node.parentElement?.closest('code, kbd')
        ? softHyphens(hyphenate(text))
        : [];
    let start = only.start;
    for (const point of points) {
      pieces.push([{ node: only.node, start, end: only.start + point }]);
      separators.push({ kind: 'hyphen', at: { node: only.node, offset: only.start + point } });
      start = only.start + point;
    }
    pieces.push(points.length ? [{ node: only.node, start, end: only.end }] : segments);
    if (w < words.length - 1) separators.push({ kind: 'space', run: runs[w] });
  });

  const range = document.createRange();
  const widths = pieces.map((segments) => segments.reduce((sum, segment) => sum + measure(range, segment), 0));
  const style = getComputedStyle(element);
  const lineWidth = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const { space, hyphen } = glyphWidths(style);
  if (!space || lineWidth <= 0) return undefined;

  const breaks = breakLines({
    widths,
    after: separators.map((separator) => separator.kind),
    space,
    hyphen,
    // Leaves room for rounding, so a full line never spills over and breaks somewhere unplanned.
    lineWidth: lineWidth - 1,
  });
  return { element, pieces, separators, breaks, space };
}

/** Offsets of the soft hyphens in a hyphenated word, counted in the word without them. */
function softHyphens(hyphenated: string) {
  const points: number[] = [];
  let length = 0;
  for (const char of hyphenated) {
    if (char === SHY) points.push(length);
    else length += char.length;
  }
  return points;
}

function measure(range: Range, { node, start, end }: Segment) {
  range.setStart(node, start);
  range.setEnd(node, end);
  // Summed, not the bounding box, in case the browser currently wraps the piece across lines.
  return Array.from(range.getClientRects()).reduce((sum, rect) => sum + rect.width, 0);
}

/** A space and a hyphen in this font, measured once per font. */
const glyphs = new Map<string, { space: number; hyphen: number }>();

function glyphWidths(style: CSSStyleDeclaration) {
  const font = [style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily, style.letterSpacing, style.wordSpacing].join('|');
  let widths = glyphs.get(font);
  if (!widths) {
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    Object.assign(probe.style, {
      position: 'absolute',
      visibility: 'hidden',
      whiteSpace: 'pre',
      fontStyle: style.fontStyle,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      letterSpacing: style.letterSpacing,
      wordSpacing: style.wordSpacing,
    });
    document.body.append(probe);
    probe.textContent = 'a a';
    const spaced = probe.getBoundingClientRect().width;
    probe.textContent = 'aa';
    const space = spaced - probe.getBoundingClientRect().width;
    probe.textContent = '-';
    const hyphen = probe.getBoundingClientRect().width;
    probe.remove();
    widths = { space, hyphen };
    glyphs.set(font, widths);
  }
  return widths;
}

function apply({ breaks, element, separators, space }: Plan) {
  // Spaces start out shrunk as far as the plan allows; the browser's justify stretches each line
  // back out to the measure.
  element.style.wordSpacing = `${(-space * SHRINK).toFixed(2)}px`;
  const lineEnds = new Set(breaks.slice(0, -1).map((end) => end - 1));
  // Edits per text node, applied from the end so earlier offsets stay valid.
  const edits = new Map<Text, Array<{ offset: number; remove: number; insert: string }>>();
  const edit = (node: Text, offset: number, remove: number, insert: string) => {
    if (!edits.has(node)) edits.set(node, []);
    edits.get(node)!.push({ offset, remove, insert });
  };

  separators.forEach((separator, k) => {
    if (separator.kind === 'space') {
      separator.run.forEach(({ node, offset }, i) => edit(node, offset, 1, i ? '' : lineEnds.has(k) ? ' ' : NBSP));
    } else if (lineEnds.has(k)) {
      edit(separator.at.node, separator.at.offset, 0, SHY);
    }
  });

  for (const [node, list] of edits) {
    if (!original.has(node)) original.set(node, node.data);
    let text = node.data;
    for (const { offset, remove, insert } of list.sort((a, b) => b.offset - a.offset)) {
      text = text.slice(0, offset) + insert + text.slice(offset + remove);
    }
    node.data = text;
  }
}

/**
 * Whether the browser set as many lines as planned. If anything inside broke differently (a rounding
 * spill, a font that loaded late) the count is off, and the paragraph goes back to plain justify.
 */
function matches({ element, breaks }: Plan) {
  const style = getComputedStyle(element);
  const lineHeight = parseFloat(style.lineHeight);
  if (!Number.isFinite(lineHeight)) return true;
  const height = element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  return Math.round(height / lineHeight) === breaks.length;
}
