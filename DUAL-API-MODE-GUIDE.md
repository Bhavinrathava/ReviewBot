# Dual API Mode System - Complete Guide

## Overview
The Velocity Review extension now supports two distinct API modes, giving users flexibility in how they want to process their code reviews:

1. **OpenAI Direct Mode**: Direct integration with OpenAI's API using user's API key
2. **Custom URL Mode**: Integration with user's own API endpoint

## Configuration System

### API Mode Selection
Users can choose between two modes via the configuration interface:

**⚙️ Configure API Mode**
- **🤖 OpenAI Direct**: Uses OpenAI API directly with user's API key
- **🔗 Custom URL**: Uses user's own API endpoint

### Configuration Options

#### 1. API Mode (`velocityReview.apiMode`)
- **Type**: Enum (`"openai"` | `"custom"`)
- **Default**: `"openai"`
- **Description**: Determines which API integration to use

#### 2. Custom API URL (`velocityReview.apiUrl`)
- **Type**: String
- **Default**: `"https://api.openai.com/v1/chat/completions"`
- **Usage**: Active when `apiMode` is set to `"custom"`
- **Description**: Custom API endpoint URL

#### 3. OpenAI API Key (`velocityReview.openaiApiKey`)
- **Type**: String (password-masked)
- **Default**: `""`
- **Usage**: Active when `apiMode` is set to `"openai"`
- **Description**: OpenAI API key for direct integration

## How It Works

### OpenAI Direct Mode (`apiMode: "openai"`)

**Configuration Required:**
- OpenAI API Key (required)
- API URL (ignored in this mode)

**API Call:**
```typescript
// Calls: https://api.openai.com/v1/chat/completions
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Rendered prompt with JSON data..."
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.7
}
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer sk-your-openai-api-key
```

### Custom URL Mode (`apiMode: "custom"`)

**Configuration Required:**
- Custom API URL (required)
- OpenAI API Key (ignored in this mode)

**API Call:**
```typescript
// Calls: User's custom URL
{
  "prompt": "Rendered prompt with JSON data...",
  "commitData": {
    "commit": { ... },
    "summary": { ... },
    "files": [ ... ]
  },
  "timestamp": "2025-06-25T22:00:00.000Z"
}
```

**Headers:**
```
Content-Type: application/json
```

## User Interface

### Configuration Menu
When users click the gear icon (⚙️), they see:

1. **⚙️ Configure API Mode**
   - Shows current mode (OpenAI Direct/Custom URL)
   - Allows switching between modes

2. **🔗 Configure Custom API URL**
   - Shows current URL and active status
   - Only relevant when in Custom URL mode

3. **🔑 Configure OpenAI API Key**
   - Shows masked API key and active status
   - Only relevant when in OpenAI Direct mode

### Visual Indicators
- **(Active)**: Shown next to the currently active configuration
- **(Inactive)**: Shown next to inactive configurations
- **Masked Display**: API keys shown as `****xxxx`

## API Response Handling

### OpenAI Direct Mode Response
Expected format:
```json
{
  "choices": [
    {
      "message": {
        "content": "AI-generated code review content..."
      }
    }
  ]
}
```

### Custom URL Mode Response
Expected format (flexible):
```json
{
  "response": "AI-generated code review content..."
}
```
OR
```json
{
  "message": "AI-generated code review content..."
}
```

## Error Handling

### OpenAI Direct Mode Errors
- Invalid API key validation
- OpenAI API rate limits
- Network connectivity issues
- Invalid response format

### Custom URL Mode Errors
- Invalid URL validation
- Custom API endpoint failures
- Network connectivity issues
- Invalid response format

### Fallback Behavior
- **No API Key (OpenAI mode)**: Automatic fallback to mock response
- **Invalid Configuration**: Clear error messages with configuration prompts
- **Network Failures**: Detailed error reporting with troubleshooting hints

## Usage Scenarios

### Scenario 1: Individual Developer with OpenAI Account
```
1. Set API Mode to "OpenAI Direct"
2. Configure OpenAI API Key
3. Start Review → Direct OpenAI integration
```

### Scenario 2: Enterprise with Custom LLM Infrastructure
```
1. Set API Mode to "Custom URL"
2. Configure Custom API URL (e.g., internal LLM service)
3. Start Review → Custom API integration
```

### Scenario 3: Testing/Development
```
1. Leave API Key empty (any mode)
2. Start Review → Mock response for testing
```

## Custom API Implementation Guide

### Expected Request Format
Your custom API should expect:
```json
{
  "prompt": "string - Rendered Jinja2 template with instructions",
  "commitData": {
    "commit": {
      "hash": "string",
      "shortHash": "string", 
      "message": "string",
      "author": "string",
      "email": "string",
      "date": "string",
      "timestamp": "number"
    },
    "summary": {
      "filesChanged": "number",
      "linesAdded": "number",
      "linesRemoved": "number",
      "totalChanges": "number"
    },
    "files": [
      {
        "filename": "string",
        "status": "string",
        "additions": "number",
        "deletions": "number", 
        "changes": "number",
        "diff": "string"
      }
    ],
    "exportedAt": "string",
    "exportedBy": "string"
  },
  "timestamp": "string"
}
```

### Expected Response Format
Your API should return:
```json
{
  "response": "Markdown-formatted code review content"
}
```
OR
```json
{
  "message": "Markdown-formatted code review content"
}
```

### Sample Custom API Implementation (Node.js/Express)
```javascript
app.post('/review', (req, res) => {
  const { prompt, commitData, timestamp } = req.body;
  
  // Process with your LLM service
  const review = await yourLLMService.generateReview(prompt, commitData);
  
  res.json({
    response: review,
    processedAt: new Date().toISOString()
  });
});
```

## Benefits of Dual Mode System

### For Individual Developers
- **Direct OpenAI Access**: Simple setup with personal API key
- **Cost Control**: Direct billing relationship with OpenAI
- **Latest Models**: Access to newest GPT models

### For Enterprises
- **Custom Infrastructure**: Use internal LLM services
- **Data Privacy**: Keep code reviews within organization
- **Cost Management**: Centralized billing and usage control
- **Compliance**: Meet security and regulatory requirements

### For Development/Testing
- **Mock Responses**: Test functionality without API costs
- **Rapid Iteration**: Develop and test without external dependencies
- **Offline Development**: Work without internet connectivity

## Security Considerations

### OpenAI Direct Mode
- API keys stored securely in VSCode settings
- Keys never logged or exposed
- Direct HTTPS communication with OpenAI

### Custom URL Mode
- No API keys transmitted
- Custom authentication handled by user's API
- Flexible security implementation

## Troubleshooting

### Common Issues

**"API mode not configured"**
- Solution: Use configuration menu to select API mode

**"OpenAI API key required"**
- Solution: Configure API key or switch to Custom URL mode

**"Custom API URL required"**
- Solution: Configure custom URL or switch to OpenAI Direct mode

**"API call failed"**
- Check network connectivity
- Verify API key/URL configuration
- Review error messages for specific issues

### Debug Information
- API mode clearly indicated in logs
- Request/response details logged to console
- Error messages include HTTP status codes
- Mock mode clearly identified

## Migration Guide

### From Single URL System
Existing configurations automatically work:
- `apiUrl` becomes custom URL
- Default mode is OpenAI Direct
- Users can switch modes as needed

### Configuration Updates
No breaking changes:
- Existing settings preserved
- New settings have sensible defaults
- Gradual migration supported

This dual API mode system provides maximum flexibility while maintaining ease of use for all user types, from individual developers to large enterprises.
