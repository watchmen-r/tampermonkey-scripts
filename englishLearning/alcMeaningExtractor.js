// ==UserScript==
// @name         ALC Japanese Meaning Extractor
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Extract and copy Japanese meanings from ALC entries
// @match        https://eow.alc.co.jp/search*
// @grant        GM_setClipboard
// ==/UserScript==

(() => {
  'use strict';

  const separator = '~~~section line~~~';

  // Wait for the DOM to fully load
  window.addEventListener('load', () => {
    const word = document.querySelector('#resultsList > div.search-use-list > ul > li > span.midashi > h2 > span').innerText.trim();

    const entries = document.querySelectorAll('#resultsList .search-use-list ul li div ol');
    if (entries.length === 0) return;

    const meaning = extractMeaning(entries);
    if (!meaning) return;

    const kana = extractKana();
    const output = `${word}\n\n${meaning}\n\n（読みは${kana}）`;

    displayText(output);

    const cliipBoard = `${separator}\n${word}\n${separator}\n${meaning}\n\n（読みは${kana}）`
    copyToClipboard(cliipBoard);
  });

  const extractMeaning = entries => {
    let text = '';
    entries.forEach(entry => {
      entry.innerText
        .trim()
        .split('\n')
        .forEach((line, idx) => {
          if (!line.startsWith('・')) text += line + '\n';
        });
    });
    return text.trim() || '';
  };

  const extractKana = () => {
    const labels = document.querySelectorAll('#resultsList .attr .label');
    for (const label of labels) {
      if (label.textContent.trim() === 'カナ') {
        const span = label.querySelector('.ls_normal');
        return getFollowingText(span.parentNode);
      }
    }
    return '';
  };

  const getFollowingText = startNode => {
    let text = '';
    let node = startNode.nextSibling;
    while (node && !(node.nodeType === Node.ELEMENT_NODE && node.classList.contains('label'))) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent.trim().replace('、', '');
      }
      node = node.nextSibling;
    }
    return text;
  };

  const copyToClipboard = str =>
    navigator.clipboard.writeText(str)
      .then(() => console.log('Copied to clipboard'))
      .catch(err => console.error('Clipboard copy failed:', err));

  const displayText = str => {
    const ta = document.createElement('textarea');
    Object.assign(ta.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      height: '300px',
      zIndex: '9999',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      padding: '10px',
      fontSize: '14px'
    });
    ta.value = str;
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
  };
})();
