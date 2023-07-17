// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Registering this listener when the script is first executed ensures that the
// offscreen document will be able to receive messages when the promise returned
// by `offscreen.createDocument()` resolves.

const _URL = "https://positive-fanatical-machine.glitch.me/signInWithRedirect.html"
const iframe = document.createElement('iframe');
iframe.src=_URL
document.documentElement.appendChild(iframe)

const observer = new MutationObserver((mutationsList, observer) => {
	console.log(mutationsList);
  for (const mutation of mutationsList) {
    // Check if the mutation is a change in attributes
    if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
      // Log the new href
      console.log('New href:', iframe.src);
    }
  }
});

// Start observing the attributes of the iframe
observer.observe(iframe, { attributes: true });

chrome.runtime.onMessage.addListener(handleChromeMessages);

function handleChromeMessages(message, sender, sendResponse) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== 'offscreen') {
    return false;
  }

  function handleIframeMessage({data}) {
    console.log('I got a message');
    try {
      data = JSON.parse(data);
      console.log(data)
//      self.removeEventListener("message", handleIframeMessage)
      sendResponse(data)
    } catch (e) {
      console.log(`json parse failed (probably fine) - ${e.message}`)
    }
  }

  self.addEventListener("message", handleIframeMessage, false);

  iframe.contentWindow.postMessage('load firebase auth', new URL(_URL).origin)

  return true;
}
