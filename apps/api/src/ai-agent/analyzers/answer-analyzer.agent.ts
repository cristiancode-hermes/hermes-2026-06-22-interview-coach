import { Injectable } from '@nestjs/common';

@Injectable()
export class AnswerAnalyzerAgent {
  analyzeContent(content: string) {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
    const paragraphCount = content.split('\n\n').filter((p) => p.trim()).length || 1;

    const hasHeaders = /^#{1,3}\s/m.test(content);
    const hasLists = /^[-*]\s|\d+\.\s/m.test(content);
    const hasCode = /```[\s\S]*?```/.test(content);
    const sentences = content
      .split(/[.!?]+/)
      .filter(Boolean)
      .map((s) => s.trim());
    const avgSentenceLength =
      sentenceCount > 0 ? wordCount / sentenceCount : 0;

    return {
      wordCount,
      sentenceCount,
      paragraphCount,
      avgSentenceLength,
      hasHeaders,
      hasLists,
      hasCode,
      sentences,
    };
  }

  detectStructure(content: string): 'well_structured' | 'partially_structured' | 'unstructured' {
    const hasHeaders = /^#{1,3}\s/m.test(content);
    const paragraphs = content.split('\n\n').filter((p) => p.trim()).length;
    const sentences = content.split(/[.!?]+/).filter(Boolean).length;

    if (hasHeaders && paragraphs >= 3 && sentences >= 5) return 'well_structured';
    if (paragraphs >= 2 && sentences >= 3) return 'partially_structured';
    return 'unstructured';
  }
}
