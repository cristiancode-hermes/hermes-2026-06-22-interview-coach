import { Injectable } from '@nestjs/common';
import { InterviewStrategy, AnalysisResult } from './interview-strategy.interface';

@Injectable()
export class LocalStrategy implements InterviewStrategy {
  async analyze(
    answerContent: string,
    questionContent: string,
    category: string,
    difficulty: string,
    keyPoints?: string[],
  ): Promise<AnalysisResult> {
    const wordCount = answerContent.split(/\s+/).filter(Boolean).length;
    const sentenceCount = answerContent.split(/[.!?]+/).filter(Boolean).length;
    const charCount = answerContent.length;
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

    const hasHeaders = /^#{1,3}\s/m.test(answerContent);
    const hasParagraphs = answerContent.split('\n\n').filter((p) => p.trim()).length > 1;
    const hasLists = /^[-*]\s|\d+\.\s/m.test(answerContent);
    const hasCodeBlocks = /```[\s\S]*?```/.test(answerContent);
    const hasBulletPoints = answerContent.split('\n').filter((l) => /^[-*]\s/.test(l)).length;

    const domainKeywords = this.getDomainKeywords(category);
    const technicalTerms = this.countTechnicalTerms(answerContent, domainKeywords);
    const codeSnippets = (answerContent.match(/`[^`]+`/g) || []).length;
    const hasExamples = /\b(for example|for instance|such as|specifically|in practice|in my experience)\b/i.test(answerContent);

    // Structure score: based on headers, paragraphs, lists, organization
    let structureScore = 5;
    if (hasHeaders) structureScore += 2;
    if (hasParagraphs) structureScore += 1.5;
    if (hasLists) structureScore += 1.5;
    if (wordCount > 100) structureScore += 1;
    structureScore = Math.min(10, Math.max(1, structureScore));

    // Clarity score: based on sentence length, readability
    let clarityScore = 5;
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) clarityScore += 2;
    else if (avgWordsPerSentence < 10) clarityScore -= 1;
    else clarityScore += 0.5;
    if (sentenceCount >= 3) clarityScore += 1;
    if (hasBulletPoints > 0) clarityScore += 1;
    if (wordCount > 50) clarityScore += 1;
    clarityScore = Math.min(10, Math.max(1, clarityScore));

    // Depth score: based on length, technical terms, code, examples
    let depthScore = 4;
    if (wordCount > 150) depthScore += 2;
    if (wordCount > 80) depthScore += 1;
    if (technicalTerms > 3) depthScore += 2;
    else if (technicalTerms > 1) depthScore += 1;
    if (hasCodeBlocks) depthScore += 1;
    if (codeSnippets > 2) depthScore += 1;
    depthScore = Math.min(10, Math.max(1, depthScore));

    // Examples score
    let examplesScore = 4;
    if (hasExamples) examplesScore += 2;
    if (hasCodeBlocks) examplesScore += 1.5;
    if (hasBulletPoints > 2) examplesScore += 1;
    if (codeSnippets > 1) examplesScore += 0.5;
    if (wordCount > 200) examplesScore += 1;
    examplesScore = Math.min(10, Math.max(1, examplesScore));

    // Keywords score
    const maxKeywords = domainKeywords.length;
    const keywordRatio = maxKeywords > 0 ? technicalTerms / maxKeywords : 0;
    let keywordsScore = 4;
    keywordsScore += keywordRatio * 4;
    if (technicalTerms > 0) keywordsScore += 1;
    if (keyPoints && keyPoints.length > 0) {
      const coveredKeyPoints = keyPoints.filter((kp) =>
        answerContent.toLowerCase().includes(kp.toLowerCase()),
      ).length;
      keywordsScore += (coveredKeyPoints / keyPoints.length) * 2;
    }
    keywordsScore = Math.min(10, Math.max(1, keywordsScore));

    // Overall score (weighted average)
    const overallScore = Math.round(
      (structureScore * 0.2 +
        clarityScore * 0.2 +
        depthScore * 0.25 +
        examplesScore * 0.2 +
        keywordsScore * 0.15) *
        10,
    ) / 10;

    // Strengths
    const strengths: string[] = [];
    if (structureScore >= 7) strengths.push('Good answer structure with clear organization');
    if (clarityScore >= 7) strengths.push('Clear and well-articulated response');
    if (depthScore >= 7) strengths.push('Demonstrates deep understanding of the topic');
    if (examplesScore >= 7) strengths.push('Provides concrete examples to support points');
    if (keywordsScore >= 7) strengths.push('Uses relevant technical terminology appropriately');
    if (hasCodeBlocks) strengths.push('Includes code examples that illustrate implementation');
    if (wordCount > 150) strengths.push('Comprehensive coverage of the topic');
    if (technicalTerms > 3) strengths.push('Strong technical vocabulary in the response');
    if (strengths.length === 0) {
      strengths.push('Response acknowledges the question');
    }

    // Improvements
    const improvements: string[] = [];
    if (structureScore < 6) improvements.push('Use headers or sections to better organize your answer');
    if (clarityScore < 6) improvements.push('Improve sentence structure and clarity');
    if (depthScore < 6) improvements.push('Add more technical depth and specific details');
    if (examplesScore < 6) improvements.push('Include concrete examples from real experience');
    if (keywordsScore < 6) improvements.push('Use more domain-specific terminology');
    if (wordCount < 80) improvements.push('Expand your answer with more detail');
    if (sentenceCount < 3) improvements.push('Structure your answer with multiple paragraphs');
    if (!hasExamples) improvements.push('Support arguments with specific examples');
    if (improvements.length === 0) {
      improvements.push('Continue practicing to maintain this level of quality');
    }

    // Sample answer (generated from keyPoints or generic)
    const sampleAnswer = this.generateSampleAnswer(questionContent, category, keyPoints);

    // Resources
    const resources = this.getResources(category);

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      structureScore: Math.round(structureScore * 10) / 10,
      clarityScore: Math.round(clarityScore * 10) / 10,
      depthScore: Math.round(depthScore * 10) / 10,
      examplesScore: Math.round(examplesScore * 10) / 10,
      keywordsScore: Math.round(keywordsScore * 10) / 10,
      strengths,
      improvements,
      sampleAnswer,
      resources,
    };
  }

  private getDomainKeywords(category: string): string[] {
    const keywords: Record<string, string[]> = {
      algorithms: [
        'time complexity', 'space complexity', 'O(n)', 'O(log n)', 'data structure',
        'array', 'linked list', 'hash map', 'tree', 'graph', 'recursion', 'dynamic programming',
        'sorting', 'searching', 'queue', 'stack', 'binary search', 'cache',
      ],
      system_design: [
        'scalability', 'reliability', 'availability', 'latency', 'throughput',
        'load balancer', 'database sharding', 'caching', 'CDN', 'microservices',
        'message queue', 'consistency', 'replication', 'partitioning', 'CAP theorem',
      ],
      frontend: [
        'React', 'component', 'state', 'props', 'hook', 'Virtual DOM', 'rendering',
        'CSS', 'JavaScript', 'TypeScript', 'responsive', 'accessibility', 'performance',
        'bundle size', 'lazy loading', 'context', 'redux', 'memoization',
      ],
      backend: [
        'API', 'REST', 'database', 'authentication', 'authorization', 'middleware',
        'ORM', 'query optimization', 'caching', 'session', 'web socket', 'microservice',
        'containerization', 'CI/CD', 'testing', 'monitoring', 'logging',
      ],
      data: [
        'database', 'schema', 'query', 'index', 'normalization', 'denormalization',
        'transaction', 'ACID', 'NoSQL', 'SQL', 'data model', 'ETL', 'data warehouse',
        'analytics', 'pipeline', 'stream processing', 'batch processing',
      ],
      behavioral: [
        'leadership', 'communication', 'teamwork', 'collaboration', 'problem-solving',
        'conflict resolution', 'mentorship', 'agile', 'scrum', 'project management',
        'stakeholder', 'deadline', 'priority', 'feedback', 'ownership',
      ],
      devops: [
        'CI/CD', 'Docker', 'Kubernetes', 'monitoring', 'infrastructure', 'automation',
        'deployment', 'rollback', 'scaling', 'load testing', 'security', 'IaC',
        'observability', 'logging', 'alerting', 'incident response',
      ],
      general: [
        'experience', 'project', 'technology', 'solution', 'problem', 'team',
        'design', 'implement', 'test', 'deploy', 'maintain', 'improve',
      ],
    };
    return keywords[category] || keywords['general'];
  }

  private countTechnicalTerms(content: string, keywords: string[]): number {
    const lowerContent = content.toLowerCase();
    return keywords.filter((kw) => lowerContent.includes(kw.toLowerCase())).length;
  }

  private generateSampleAnswer(question: string, category: string, keyPoints?: string[]): string {
    if (keyPoints && keyPoints.length > 0) {
      return `A strong answer to "${question.replace(/^.+?\s/, '').slice(0, 60)}..." would cover:\n\n` +
        keyPoints.map((kp, i) => `${i + 1}. **${kp}** - Explain this concept in detail with relevant examples from your experience.`).join('\n') +
        `\n\nRemember to structure your answer using the STAR method (Situation, Task, Action, Result) for behavioral questions or a clear problem-solution format for technical questions.`;
    }
    return `For this ${category} question, start by clarifying the scope, then walk through your approach systematically, covering key considerations, trade-offs, and concrete examples from your experience.`;
  }

  private getResources(category: string): { title: string; url: string }[] {
    const resourceMap: Record<string, { title: string; url: string }[]> = {
      algorithms: [
        { title: 'LeetCode - Algorithm Practice', url: 'https://leetcode.com' },
        { title: 'Big O Cheat Sheet', url: 'https://www.bigocheatsheet.com' },
        { title: 'GeeksforGeeks - Algorithms', url: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/' },
      ],
      system_design: [
        { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
        { title: 'High Scalability Blog', url: 'http://highscalability.com' },
        { title: 'AWS Architecture Center', url: 'https://aws.amazon.com/architecture/' },
      ],
      frontend: [
        { title: 'React Documentation', url: 'https://react.dev' },
        { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
        { title: 'Frontend Masters', url: 'https://frontendmasters.com' },
      ],
      backend: [
        { title: 'REST API Tutorial', url: 'https://restfulapi.net' },
        { title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices' },
        { title: 'Microservices.io', url: 'https://microservices.io' },
      ],
      behavioral: [
        { title: 'STAR Method Guide', url: 'https://www.themuse.com/advice/star-interview-method' },
        { title: 'Behavioral Interview Prep', url: 'https://interviewing.io/guides/behavioral' },
      ],
    };
    return resourceMap[category] || resourceMap['general'] || [
      { title: 'Interview Preparation Guide', url: 'https://interviewcoach.example.com/guide' },
    ];
  }
}
