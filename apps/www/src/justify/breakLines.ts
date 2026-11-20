/**
 * Optimal line breaking for justified text, after Knuth and Plass ("Breaking Paragraphs into Lines",
 * 1981), the algorithm TeX uses. Browsers break greedily, filling each line as far as it goes, which
 * leaves some justified lines with wide gaps; this looks at the whole paragraph and picks the breaks
 * that keep every line's spacing as even as possible. Adapted from bookblitz's src/ui/justify.ts, with
 * hyphenation points added.
 *
 * The browser does the final justifying, and it can only stretch spaces. So justified paragraphs get
 * a slightly negative word-spacing (see justify.ts): their natural spaces are the shrunk ones, and a
 * line planned at "normal" spacing is one the browser stretches a little. No fitness classes; it's a
 * shortest path over break positions, scored with TeX's badness and demerits.
 */

/** How far a space may stretch, as a share of its natural width, before a line counts as loose. */
const STRETCH = 1;
/** How far a space may shrink. Kept small, since the last line of a paragraph shows it unstretched. */
export const SHRINK = 0.15;
/** Cost added to every line, so fewer lines win when spacing is otherwise equal (TeX's \linepenalty). */
const LINE_PENALTY = 10;
/** Cost of ending a line with a hyphen (TeX's \hyphenpenalty). */
const HYPHEN_PENALTY = 80;
/** Extra demerits for two hyphenated lines in a row (TeX's \doublehyphendemerits). */
const DOUBLE_HYPHEN = 12000;
/** Extra demerits for a last line shorter than this share of the measure, a lonely word at the end. */
const RUNT = 0.15;
const RUNT_DEMERITS = 2000;
/** A line stretched beyond this ratio is allowed only if there's no better way. */
const LOOSE_LIMIT = 3;

export type Paragraph = {
  /** Widths of the pieces of text between break opportunities: whole words, or parts of hyphenated ones. */
  widths: number[];
  /** What follows each piece but the last: a space, or a hyphenation point inside the word. */
  after: Array<'space' | 'hyphen'>;
  space: number;
  hyphen: number;
  lineWidth: number;
};

/**
 * Where to break: for each line, the index one past its last piece. The last line is set ragged at
 * its natural spacing. `loose` says the best breaks still stretch some line beyond LOOSE_LIMIT, as
 * in a short paragraph of long words in a narrow column; such text reads better ragged.
 */
export function breakLines({ widths, after, space, hyphen, lineWidth }: Paragraph): { breaks: number[]; loose: boolean } {
  const n = widths.length;
  if (!n) return { breaks: [], loose: false };

  // Prefix sums of piece widths and of spaces, so a line's natural width is O(1).
  const width = [0];
  const spaces = [0];
  for (let k = 0; k < n; k++) {
    width.push(width[k] + widths[k]);
    spaces.push(spaces[k] + (k < n - 1 && after[k] === 'space' ? 1 : 0));
  }
  const endsWithHyphen = (j: number) => j < n && after[j - 1] === 'hyphen';

  const best = new Array<number>(n + 1).fill(Infinity);
  const from = new Array<number>(n + 1).fill(-1);
  const tooLoose = new Array<boolean>(n + 1).fill(false);
  best[0] = 0;

  for (let i = 0; i < n; i++) {
    if (best[i] === Infinity) continue;
    for (let j = i + 1; j <= n; j++) {
      // Spaces strictly inside the line; a space at its end disappears into the break.
      const gaps = spaces[j - 1] - spaces[i];
      const natural = width[j] - width[i] + gaps * space + (endsWithHyphen(j) ? hyphen : 0);
      const tightest = natural - gaps * space * SHRINK;
      // A single piece too wide for the line still has to go somewhere.
      if (tightest > lineWidth && j > i + 1) break;

      let cost: number;
      let ratio = 0;
      if (j === n) {
        cost = natural < lineWidth * RUNT && i > 0 ? RUNT_DEMERITS : 0;
      } else {
        const slack = lineWidth - natural;
        // A line with no spaces can't be justified; it's fine only if the word nearly fills it,
        // like a long URL, and otherwise as bad as an overly loose line.
        ratio =
          gaps === 0
            ? natural > lineWidth * 0.8
              ? 0
              : Infinity
            : slack / (gaps * space * (slack < 0 ? SHRINK : STRETCH));
        const badness = 100 * Math.abs(ratio) ** 3;
        cost = (LINE_PENALTY + Math.min(badness, 10000)) ** 2 + (ratio > LOOSE_LIMIT ? 1e8 : 0);
        if (endsWithHyphen(j)) {
          cost += HYPHEN_PENALTY ** 2 + (i > 0 && endsWithHyphen(i) ? DOUBLE_HYPHEN : 0);
        }
      }
      if (best[i] + cost < best[j]) {
        best[j] = best[i] + cost;
        from[j] = i;
        tooLoose[j] = ratio > LOOSE_LIMIT;
      }
    }
  }

  const breaks: number[] = [];
  let loose = false;
  for (let j = n; j > 0; j = from[j]) {
    breaks.push(j);
    loose ||= tooLoose[j];
  }
  return { breaks: breaks.reverse(), loose };
}
