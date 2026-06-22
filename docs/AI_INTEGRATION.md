# AI Integration — Interview Coach

**Rung:** 2-3 (structured analysis with adaptive agent coordination)
**Strategy:** Strategy Pattern (Local heuristic fallback + OpenAI-ready)

## AI Capabilities

### 1. Answer Analysis (implemented)
The AI Agent Coordinator analyzes written interview answers across 5 dimensions:
- **Structure** (20%) — headers, paragraphs, lists, organization
- **Clarity** (20%) — sentence length, readability, bullet points
- **Depth** (25%) — word count, technical terms, code snippets
- **Examples** (20%) — concrete examples, code blocks, references
- **Keywords** (15%) — domain-specific terminology, key point coverage

Each dimension scored 1-10. Overall score is a weighted average.

### 2. Local Strategy (active fallback)
Since `OPENAI_API_KEY` is empty, the Local Strategy uses heuristic analysis:
- Counts domain keywords matched (7 domain keyword sets)
- Detects structure markers (headers, paragraphs, lists)
- Counts code snippets and technical terms
- Detects examples with pattern matching
- Generates structured feedback with strengths, improvements, and sample answers
- Provides curated resource links per category

### 3. OpenAI Strategy (ready)
```typescript
class OpenAIStrategy implements InterviewStrategy {
  async analyze(answer: string, question: string, category: string, difficulty: string, keyPoints?: string[]): Promise<AnalysisResult> {
    const prompt = buildPrompt(answer, question, category, difficulty, keyPoints);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    return JSON.parse(response.choices[0].message.content);
  }
}
```
Ready to enable by setting `OPENAI_API_KEY` in `.env`.

### 4. Adaptive Question Generation (future)
The Question Adapter Agent tracks user performance per category and adjusts:
- Question difficulty (easy → medium → hard based on streak)
- Category focus (prioritize weakest areas)
- Key point coverage (ensure diverse topics)

## AI Agent Components

| Agent | Responsibility |
|-------|---------------|
| AIAgentCoordinator | Selects strategy, orchestrates pipeline |
| AnswerAnalyzer | Content metrics + feedback generation |
| QuestionAdapter | Adaptive difficulty adjustment |
| ProgressTracker | Cross-session performance aggregation |

## Prompts

The OpenAI strategy would use:
- **System prompt:** "You are an expert technical interviewer analyzing candidate responses..."
- **User prompt:** Includes question, answer, context (role/seniority/category), and expected key points
- **Output format:** Strict JSON with all 5 dimension scores, arrays of strengths/improvements, sample answer, and resources
