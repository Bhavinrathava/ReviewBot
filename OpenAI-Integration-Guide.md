# OpenAI Integration Guide for Velocity Review Extension

## Overview
The Velocity Review extension now includes full OpenAI API integration with secure API key management and intelligent fallback to mock responses for testing.

## Configuration Options

### 1. API URL Configuration
- **Default**: `https://api.openai.com/v1/chat/completions`
- **Purpose**: Endpoint for OpenAI API calls
- **Customizable**: Yes, supports any OpenAI-compatible API

### 2. OpenAI API Key Configuration
- **Format**: `sk-...` (standard OpenAI API key format)
- **Storage**: Securely stored in VSCode global settings
- **Validation**: Real-time validation with format checking
- **Privacy**: Displayed as masked (`****xxxx`) in configuration UI

## How to Configure

### Step 1: Access Configuration
1. Click the gear icon (⚙️) in the Velocity Review sidebar
2. Select configuration option from the dropdown menu

### Step 2: Configure API URL (Optional)
1. Choose "🔗 Configure API URL"
2. Enter your preferred endpoint (default is OpenAI's)
3. URL validation ensures proper format

### Step 3: Configure API Key
1. Choose "🔑 Configure OpenAI API Key"
2. Enter your OpenAI API key (starts with `sk-`)
3. Key is validated and stored securely

## API Integration Features

### Smart Fallback System
- **With API Key**: Makes actual OpenAI API calls
- **Without API Key**: Uses comprehensive mock responses for testing
- **Error Handling**: Graceful fallback with detailed error messages

### OpenAI API Call Structure
```typescript
{
  model: "gpt-4",
  messages: [
    {
      role: "user",
      content: "Generated prompt with commit data"
    }
  ],
  max_tokens: 2000,
  temperature: 0.7
}
```

### Response Processing
- Handles OpenAI's chat completion format
- Extracts message content from response
- Provides detailed error messages for troubleshooting

## Security Features

### API Key Protection
- Password-masked input field
- Stored in VSCode's secure settings
- Never logged or exposed in console
- Validation prevents invalid keys

### Error Handling
- Network failure recovery
- API rate limit handling
- Invalid response format detection
- Comprehensive error reporting

## Usage Workflow

### 1. Initial Setup
```
User clicks config button → Selects API key option → Enters key → Key validated and stored
```

### 2. Code Review Process
```
User clicks "Start Review" → 
Git analysis → 
Prompt generation → 
API key retrieval → 
OpenAI API call → 
Response processing → 
Results display
```

### 3. Fallback Behavior
```
No API key configured → 
Automatic mock response → 
Full functionality maintained → 
User can test without API costs
```

## API Response Format

### Successful Response
```json
{
  "success": true,
  "response": "Detailed markdown code review content"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

## Mock Response Features
When no API key is configured, the system provides:
- Comprehensive code review analysis
- Structured feedback in all categories
- Professional markdown formatting
- Realistic review content for testing

## Configuration Storage
- **API URL**: `velocityReview.apiUrl`
- **API Key**: `velocityReview.openaiApiKey`
- **Scope**: Global (persists across VSCode sessions)
- **Access**: VSCode settings API

## Error Scenarios Handled
1. **Invalid API Key**: Clear validation messages
2. **Network Failures**: Timeout and connection error handling
3. **API Rate Limits**: Proper HTTP status code handling
4. **Invalid Responses**: JSON parsing and format validation
5. **Missing Configuration**: User-friendly prompts to configure

## Testing Without API Key
The extension provides full functionality without requiring an OpenAI API key:
- Mock responses simulate real AI analysis
- All features remain functional
- No API costs incurred during testing
- Seamless transition when API key is added

## Best Practices
1. **API Key Security**: Never share or commit API keys
2. **Rate Limiting**: Be mindful of OpenAI usage limits
3. **Error Monitoring**: Check console for detailed error logs
4. **Testing**: Use mock mode for development and testing
5. **Configuration**: Verify settings before first use

## Troubleshooting

### Common Issues
1. **"API call failed"**: Check API key validity and network connection
2. **"Invalid response format"**: Verify API URL is correct
3. **"No API key provided"**: Configure API key or use mock mode
4. **Rate limit errors**: Wait and retry, or check OpenAI usage

### Debug Information
- API call details logged to console
- Prompt length and URL displayed
- Error messages include HTTP status codes
- Mock mode clearly indicated in logs

This integration provides a robust, secure, and user-friendly way to leverage OpenAI's capabilities for intelligent code review while maintaining full functionality even without API access.
