# Real-Debrid Torrent Cache Checker Script

### Created by: VulpesThesis

## Overview

This script is designed to streamline the process of checking torrent cache status using the Real-Debrid API.
It captures magnet links automatically from web pages, checks whether the files are cached, and provides feedback on the status.
The script also offers a manual input option for magnet links, ensuring flexibility and ease of use.

## Key Features

- **Automatic Magnet Link Detection**: The script scans web pages for magnet links, automatically capturing and processing them.
- **Cache Status Feedback**: Once captured, the script checks the cache status of each magnet link, informing you whether the files are cached or not.
- **Manual Magnet Link Input**: For cases where automatic capture is not possible, you can manually input magnet links to check their cache status.
- **Magnet Link Sanitization**: The script automatically sanitizes magnet links by extracting the necessary hash number for accurate processing.
- **Duplicate Link Handling**: It identifies and ignores duplicate magnet links, ensuring only unique links are processed and displayed.
- **Draggable Interface**.
- **Click To Copy Magnet Link**.

## Future Improvements (To-Do List)

1. **.torrent File Magnet Link Extraction**: Integrate functionality to extract magnet links from .torrent files.
2. **Initial Configuration Setup**: Add an initial setup wizard for easy API key configuration.
3. **Settings Page**: Develop a settings page to customize and manage script preferences.
4. **Stream/Download Button**

## Getting Started

1. **API Key Setup**: Ensure you have your Real-Debrid API key ready. You will need to input this key for the script to function correctly.
2. **Running the Script**: Add the Script to TamperMonkey and add the API key to Line 18. EX. const AUTH_TOKEN = 'ADD YOUR API KEY HERE' -> const AUTH_TOKEN = '12345';
4. **Manual Checks**: If needed, you can input magnet links manually for cache checking.

## Notes

- The script is designed to be as user-friendly as possible, with automated processes where feasible. 
- Always ensure that your API key remains confidential and is not shared publicly.

## License

This script is free to use and modify. Contributions and improvements are welcome. Please credit the original creator, VulpesThesis, in any forks or derivative works.
