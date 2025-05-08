// src/utils/formatInsights.ts

/**
 * Formats insight text by converting markdown-style formatting to HTML
 * and preserving paragraph breaks
 *
 * @param text The raw insight text
 * @returns Formatted HTML for rendering
 */
export function formatInsightText(text: string): string {
  if (!text) return '';

  // Step 1: Replace markdown bold with HTML strong tags
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Step 2: Replace linebreaks with paragraph breaks
  formattedText = formattedText
    .split('\n\n')
    .map((paragraph) => `<p>${paragraph.trim()}</p>`)
    .join('');

  // Step 3: If there are no paragraphs yet (no double line breaks in original text),
  // wrap the entire content in a paragraph tag
  if (!formattedText.includes('<p>')) {
    formattedText = `<p>${formattedText}</p>`;
  }

  // Step 4: Replace single linebreaks with <br> tags within paragraphs
  formattedText = formattedText.replace(
    /<p>(.*?)\n(.*?)<\/p>/g,
    '<p>$1<br>$2</p>'
  );

  return formattedText;
}
