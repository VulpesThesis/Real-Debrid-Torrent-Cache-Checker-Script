// ==UserScript==
// @name         Real-Debrid Torrent Cache Checker with Clickable Results
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Check if a torrent is cached on Real-Debrid by entering a link, detecting torrents and hashes on the page
// @author       VulpesThesis
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // Your Real-Debrid API token
    const AUTH_TOKEN = 'ADD YOUR API KEY HERE';

    // Load previous position from localStorage
    const savedPosition = JSON.parse(localStorage.getItem('rd-torrent-checker-position')) || { top: 10, left: 10 };

    // Create a container for the input box and button
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = savedPosition.top + 'px';
    container.style.left = savedPosition.left + 'px';
    container.style.zIndex = '9999';
    container.style.backgroundColor = '#edf2f7'; // Soft blue-gray background
    container.style.border = '1px solid #ccc';
    container.style.padding = '0';
    container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    container.style.borderRadius = '8px'; // Rounded corners

    // Create a header for dragging
    const header = document.createElement('div');
    header.style.padding = '10px';
    header.style.cursor = 'move'; // Change cursor to indicate the element is draggable
    header.style.backgroundColor = '#cbd5e0'; // Slightly darker blue-gray background
    header.style.borderBottom = '1px solid #ccc';
    header.style.borderTopLeftRadius = '8px'; // Match rounded corners
    header.style.borderTopRightRadius = '8px'; // Match rounded corners
    header.style.color = '#2d3748'; // Dark gray text
    header.innerText = 'Drag here';

    // Create the input box
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter torrent link or hash';
    input.style.width = '280px';  // Adjust width to fit within the container padding
    input.style.margin = '10px';  // Add margin to align with button
    input.style.padding = '5px';
    input.style.backgroundColor = '#ffffff'; // White background for input
    input.style.color = '#2d3748'; // Dark gray text
    input.style.border = '1px solid #a0aec0'; // Light gray border
    input.style.borderRadius = '4px'; // Slightly rounded corners for input

    // Create the button
    const button = document.createElement('button');
    button.innerText = 'Check Cache';
    button.style.margin = '10px';
    button.style.padding = '5px 10px';
    button.style.backgroundColor = '#3182ce'; // Complementary blue for the button
    button.style.color = '#ffffff'; // White text
    button.style.border = 'none';
    button.style.borderRadius = '4px'; // Rounded corners for button
    button.style.cursor = 'pointer'; // Pointer cursor for button

    // Append header, input, and button to container
    container.appendChild(header);
    container.appendChild(input);
    container.appendChild(button);

    // Create a results container below the main container
    const resultsContainer = document.createElement('div');
    resultsContainer.style.position = 'fixed';
    resultsContainer.style.top = (savedPosition.top + 120) + 'px'; // Position below the main container
    resultsContainer.style.left = savedPosition.left + 'px';
    resultsContainer.style.zIndex = '9998'; // Slightly lower z-index
    resultsContainer.style.backgroundColor = '#edf2f7';
    resultsContainer.style.border = '1px solid #ccc';
    resultsContainer.style.padding = '10px';
    resultsContainer.style.width = '300px';
    resultsContainer.style.maxHeight = '200px';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.borderRadius = '8px';
    resultsContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    resultsContainer.innerText = 'Cached Torrents Found:';

    // Append results container to body
    document.body.appendChild(container);
    document.body.appendChild(resultsContainer);

    // Function to save position to localStorage
    function savePosition(top, left) {
        localStorage.setItem('rd-torrent-checker-position', JSON.stringify({ top, left }));
    }

    // Function to handle dragging only from the header
    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            // Get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            // Calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Set the element's new position:
            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;
            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
            // Move the results container as well
            resultsContainer.style.top = (newTop + 120) + "px";
            resultsContainer.style.left = newLeft + "px";
        }

        function closeDragElement() {
            // Stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
            // Save the position
            savePosition(container.offsetTop, container.offsetLeft);
        }
    }

    // Apply draggable functionality to the container via the header
    makeDraggable(container, header);

    // Function to clean link and get hash from magnet link
    function getHashFromMagnet(magnetLink) {
        const hashRegex = /magnet:\?xt=urn:btih:([a-zA-Z0-9]{40,})/i;
        const match = magnetLink.match(hashRegex);
        if (match && match.length > 1) {
            return match[1];
        }
        return null;
    }

    // Function to check if the torrent is cached on Real-Debrid
    function checkTorrentCache(torrentIdentifier) {
        const url = `https://api.real-debrid.com/rest/1.0/torrents/instantAvailability/${encodeURIComponent(torrentIdentifier)}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Accept': 'application/json'
            },
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        const result = JSON.parse(response.responseText);
                        // Check if the result actually contains cached files
                        const isCached = checkIfTorrentIsCached(result);
                        addTorrentToResults(torrentIdentifier, isCached ? result : null);
                    } catch (e) {
                        console.error('Error parsing JSON response:', e);
                        alert('Error parsing response.');
                    }
                } else {
                    console.error('Error response:', response);
                    alert('Error checking torrent cache: ' + response.statusText);
                }
            },
            onerror: function(error) {
                console.error('Request failed:', error);
                alert('Request failed');
            }
        });
    }

    // Function to add found torrents to the results box
    function addTorrentToResults(torrentIdentifier, result) {
        const resultItem = document.createElement('div');
        resultItem.style.marginTop = '5px';
        resultItem.style.padding = '5px';
        resultItem.style.backgroundColor = result ? '#9ae6b4' : '#feb2b2'; // Green if found, red if not
        resultItem.style.borderRadius = '4px';
        resultItem.style.color = '#2d3748';
        resultItem.style.wordWrap = 'break-word';
        resultItem.style.cursor = 'pointer';

        if (result) {
            // Extract and display filename from the result
            const filename = extractFilename(result);
            resultItem.textContent = `✅ Cached: ${filename}`;
            // Add click event to copy hash to clipboard
            resultItem.addEventListener('click', function() {
                GM_setClipboard(torrentIdentifier);
            });
        } else {
            resultItem.textContent = `❌ Not Cached: ${torrentIdentifier}`;
        }

        resultsContainer.appendChild(resultItem);
    }

    // Function to check if the result actually contains cached data
    function checkIfTorrentIsCached(result) {
        try {
            const hash = Object.keys(result)[0]; // Get the first hash key
            const rd = result[hash]?.rd; // Access the 'rd' array
            return rd && rd.length > 0; // Return true if the 'rd' array has items
        } catch (e) {
            console.error('Error checking if torrent is cached:', e);
        }
        return false;
    }

    // Function to extract the filename from the result object
    function extractFilename(result) {
        try {
            const hash = Object.keys(result)[0]; // Get the first hash key
            const rd = result[hash]?.rd; // Access the 'rd' array
            if (rd && rd.length > 0) {
                const fileData = rd[0]; // Get the first item in the 'rd' array
                const fileInfo = Object.values(fileData)[0]; // Access the first file info object
                return fileInfo.filename; // Return the filename
            }
        } catch (e) {
            console.error('Error extracting filename:', e);
        }
        return 'Unknown file';
    }

    // Track processed hashes for this page load only
    const processedHashes = new Set();

    button.addEventListener('click', function() {
        const torrentLink = input.value.trim();  // Get the value from the input field and trim any whitespace
        if (torrentLink) {
            const hash = getHashFromMagnet(torrentLink) || torrentLink;
            if (!processedHashes.has(hash)) {
                processedHashes.add(hash);
                checkTorrentCache(hash);
            } else {
                alert('This torrent has already been checked on this page.');
            }
        } else {
            alert('Please enter a valid torrent link or hash.');
        }
    });

    // Function to find and check all torrents and magnet links on the page
    function checkPageForTorrents() {
        // Find all <a> tags and check if they contain a magnet link
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const magnetHref = link.href;
            if (magnetHref.startsWith('magnet:')) {
                const hash = getHashFromMagnet(magnetHref);
                if (hash && !processedHashes.has(hash)) {
                    processedHashes.add(hash);
                    checkTorrentCache(hash);
                }
            }
        });

        // Additionally, find any raw magnet links or hashes in the page text
        const pageText = document.body.innerText;
        const magnetRegex = /magnet:\?xt=urn:btih:[a-zA-Z0-9]{40,}[^"]*/gi;
        const hashRegex = /\b[0-9a-fA-F]{40}\b/g;
        const foundHashes = [...pageText.matchAll(magnetRegex), ...pageText.matchAll(hashRegex)];

        foundHashes.forEach(match => {
            const hash = getHashFromMagnet(match[0]) || match[0];
            if (hash && !processedHashes.has(hash)) {
                processedHashes.add(hash);
                checkTorrentCache(hash);
            }
        });
    }

    // Run the function to find torrents and magnet links on page load
    window.addEventListener('load', checkPageForTorrents);

})();
