# Chrome Extension: Page Summarizer

A Chrome extension that uses OpenAI's GPT to summarize web page content with a beautiful Vue 3 + PrimeVue interface.

## Features

- **Smart Content Extraction**: Automatically extracts main content from web pages or selected text
- **AI-Powered Summarization**: Uses OpenAI GPT-3.5-turbo for intelligent summarization
- **Customizable Summaries**: Choose between different lengths (short, medium, detailed) and types (key points, narrative, technical)
- **History Management**: Saves recent summaries with timestamps and settings
- **Modern UI**: Beautiful interface built with Vue 3 and PrimeVue components
- **Copy to Clipboard**: Easy one-click copying of summaries

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist` folder
7. Get your OpenAI API key from [OpenAI](https://platform.openai.com/api-keys)
8. Click the extension icon and enter your API key in settings

## Usage

1. Navigate to any web page
2. Click the Page Summarizer extension icon
3. Configure your summarization preferences (optional)
4. Click "Summarize This Page"
5. View and copy your AI-generated summary

## Privacy & Security

- Your OpenAI API key is stored locally in Chrome's secure storage
- No data is sent to external servers except OpenAI for summarization
- Page content is processed locally when possible

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Technologies Used

- Vue 3 with Composition API
- PrimeVue UI Components
- TypeScript
- Vite
- Chrome Extensions API
- OpenAI GPT-3.5-turbo API

## License

MIT License - feel free to use and modify as needed.