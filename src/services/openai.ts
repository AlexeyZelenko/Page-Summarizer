interface SummarizeOptions {
  length: 'short' | 'medium' | 'detailed';
  type: 'key_points' | 'narrative' | 'technical';
  language: string;
}

class OpenAIService {
  private async makeRequest(apiKey: string, messages: any[]) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: this.getMaxTokens(),
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No summary generated'
  }

  private getMaxTokens(): number {
    return 500 // Reasonable limit for summaries
  }

  private getSummaryPrompt(
    content: string,
    options: SummarizeOptions
  ): string {
    const { length, type, language } = options;
    const lengthMap = {
      short: '1-2 paragraphs',
      medium: '3-4 paragraphs',
      detailed: '5 or more paragraphs'
    };

    const typeMap = {
      key_points: 'a list of key points and takeaways.',
      narrative: 'a smooth, narrative-style summary.',
      technical: 'a detailed, technical summary focusing on data and facts.'
    };

    return `
      Summarize the following content in about ${lengthMap[length]}.
      Provide the summary as ${typeMap[type]}
      The summary must be in ${language}.

      Content to summarize:
      ---
      ${content}
      ---
    `;
  }

  async summarize(content: string, apiKey: string, options: SummarizeOptions): Promise<string> {
    if (!content || content.trim().length === 0) {
      throw new Error('No content provided for summarization')
    }

    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Valid OpenAI API key is required')
    }

    // Truncate content if too long (approximately 3000 tokens = ~12000 characters)
    const maxContentLength = 12000
    let processedContent = content.trim()
    
    if (processedContent.length > maxContentLength) {
      processedContent = processedContent.substring(0, maxContentLength) + '...[content truncated]'
    }

    const prompt = this.getSummaryPrompt(processedContent, options)
    
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates clear, accurate summaries of web page content. Focus on the main ideas and important information while maintaining readability.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    try {
      return await this.makeRequest(apiKey, messages)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to generate summary')
    }
  }
}

export const openAIService = new OpenAIService()