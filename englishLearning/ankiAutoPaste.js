// ==UserScript==
// @name         ANKI automatic paste
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Paste word and meaning after copy them from ALC dictionary.
// @author       You
// @match        https://ankiuser.net/add
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ankiuser.net
// @grant        none
// ==/UserScript==

(() => {
  'use strict';
  const separator = '~~~section line~~~';

  // Create a button to trigger paste
  const button = document.createElement('button');
  button.textContent = '📋 Paste & Split Sections';
  button.style.position = 'fixed';
  button.style.top = '20px';
  button.style.right = '20px';
  button.style.zIndex = 9999;
  button.style.padding = '10px';
  button.style.background = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';

  document.body.appendChild(button);

  button.addEventListener('click', async () => {
    let rawText = '';

    try {
      rawText = await navigator.clipboard.readText();
    } catch (err) {
      alert('❌ Failed to read from clipboard.\nYou may need to allow clipboard permission.');
      return;
    }

    if (!rawText.startsWith(separator)) return;

    const sections = rawText.split(separator).map(s => s.trim()).filter(Boolean);
    if (sections.length < 2) return;

    const firstDiv = document.querySelector('body > div > main > form > div:nth-child(1) > div > div');
    const secondDiv = document.querySelector('body > div > main > form > div:nth-child(2) > div > div');
    const event = new Event('input', {
      bubbles: true,
      cancelable: true
    });

    if (firstDiv) {
      firstDiv.innerText = sections[0];
      // Dispatch input event to simulate typing since a button in Anki detects and enables it by JavaScript.
      firstDiv.dispatchEvent(event);
    }

    if (secondDiv) {
      secondDiv.innerHTML = sections[1].replace(/\n/g, '<br>');
      secondDiv.dispatchEvent(event);
    }
  });
})();
