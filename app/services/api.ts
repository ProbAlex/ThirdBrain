// Define types for our configuration and messages
interface ModelConfig {
  model: string;
  baseUrl: string;
  apiConfig: {
    endpoint: string;
    method: string;
    headers: Record<string, string>;
  };
  requestFormat: {
    model: string;
    messages: any[];
    stream: boolean;
    options: {
      temperature: number;
      top_p: number;
      max_tokens: number;
    };
  };
  messageFormatting: {
    system: string;
    userPrefix: string;
    assistantPrefix: string;
    messageDelimiter: string;
    includePreviousMessages: boolean;
    maxPreviousMessages: number;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

// Properly typed API response
interface ApiResponse {
  message: {
    content: string;
    role: string;
  } | null;
  done: boolean;
  error?: string;
}

// Hardcoded model configuration - in a real app, this would come from an API route
const MODEL_CONFIG: ModelConfig = {
  model: "dolphin-mistral",
  baseUrl: "https://ai.alexalex.net",
  apiConfig: {
    endpoint: "/api/chat",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  },
  requestFormat: {
    model: "dolphin-mistral",
    messages: [],
    stream: true, // Enable streaming
    options: {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2000
    }
  },
  messageFormatting: {
    system: "You are 3rd Brain, a helpful assistant with expertise in various topics. Provide concise, accurate and helpful responses.",
    userPrefix: "",
    assistantPrefix: "",
    messageDelimiter: "\n\n",
    includePreviousMessages: true,
    maxPreviousMessages: 10
  }
};

// Load model configuration
export function loadModelConfig(): ModelConfig {
  return MODEL_CONFIG;
}

// Format messages for the Ollama API
export function formatMessagesForAPI(messages: Message[]): any[] {
  const config = loadModelConfig();
  const { messageFormatting } = config;
  const { system, includePreviousMessages, maxPreviousMessages } = messageFormatting;
  
  // Create the formatted messages array
  const formattedMessages = [];
  
  // Add system message if it exists in the configuration
  if (system) {
    formattedMessages.push({
      role: 'system',
      content: system
    });
  }
  
  // Include only the most recent messages based on configuration
  const messagesToInclude = includePreviousMessages 
    ? messages.filter(msg => msg.role !== 'system').slice(-maxPreviousMessages) 
    : [messages.filter(msg => msg.role !== 'system').pop()].filter(Boolean);
  
  // Add each message to the array
  messagesToInclude.forEach(message => {
    formattedMessages.push({
      role: message.role,
      content: message.content
    });
  });
  
  return formattedMessages;
}

// Process streaming response from Ollama API
async function processStream(
  response: Response, 
  onChunk: (chunk: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is null');
  }

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // Decode the chunk and add to buffer
      const text = decoder.decode(value, { stream: true });
      buffer += text;

      // Process complete JSON objects from the buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

      for (const line of lines) {
        if (line.trim() === '') continue;
        
        try {
          const data = JSON.parse(line);
          if (data && data.message && data.message.content) {
            const content = data.message.content;
            fullText += content;
            onChunk(content);
          }
        } catch (e) {
          console.error('Error parsing JSON:', line, e);
        }
      }
    }
    
    return fullText;
  } catch (error) {
    console.error('Error processing stream:', error);
    throw error;
  }
}

// Make API request to Ollama with streaming support
export async function queryModel(
  messages: Message[], 
  onChunk?: (chunk: string) => void
): Promise<{ text: string }> {
  try {
    const config = loadModelConfig();
    const { baseUrl, apiConfig, requestFormat } = config;
    
    // Format the messages for the API
    const formattedMessages = formatMessagesForAPI(messages);
    
    // Create the request payload
    const payload = {
      ...requestFormat,
      messages: formattedMessages
    };
    
    console.log('Sending request to:', `${baseUrl}${apiConfig.endpoint}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // ALWAYS USE REAL API - mock mode disabled
    const useMockResponse = false;
    
    // Make the actual API request
    const response = await fetch(`${baseUrl}${apiConfig.endpoint}`, {
      method: apiConfig.method,
      headers: apiConfig.headers,
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Handle streaming if callback is provided
    if (onChunk && response.body) {
      const fullText = await processStream(response, onChunk);
      return { text: fullText };
    } else {
      // Fall back to non-streaming if no callback
      const data = await response.json() as ApiResponse;
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      if (!data || !data.message) {
        throw new Error('Invalid API response: No message field received');
      }
      
      const messageContent = data.message.content;
      if (!messageContent) {
        throw new Error('Invalid API response: No content in message');
      }
      
      return { text: messageContent };
    }
  } catch (error) {
    console.error('Error querying model:', error);
    throw new Error('Failed to get response from AI model');
  }
}

// Create a chat completion with message history
export async function createChatCompletion(
  messages: Message[],
  onChunk?: (chunk: string) => void
): Promise<{ response: string }> {
  try {
    console.log('Creating chat completion with messages:', JSON.stringify(messages, null, 2));
    const { text } = await queryModel(messages, onChunk);
    
    return {
      response: text
    };
  } catch (error) {
    console.error('Error creating chat completion:', error);
    throw new Error('Failed to generate chat completion');
  }
}
