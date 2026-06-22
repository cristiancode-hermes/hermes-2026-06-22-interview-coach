import { Injectable } from '@nestjs/common';

interface QuestionPreset {
  content: string;
  category: string;
  difficulty: string;
  keyPoints: string[];
}

@Injectable()
export class QuestionGeneratorAgent {
  private readonly presets: Record<string, QuestionPreset[]> = {
    algorithms: [
      {
        content: 'Explain how you would implement a Least Recently Used (LRU) cache. What data structure would you use and why?',
        category: 'algorithms',
        difficulty: 'medium',
        keyPoints: ['LRU cache eviction policy', 'HashMap + Doubly Linked List', 'O(1) operations', 'Ordered dictionary alternative'],
      },
      {
        content: 'Given an array of integers, find two numbers that add up to a specific target. Describe the most efficient approach.',
        category: 'algorithms',
        difficulty: 'easy',
        keyPoints: ['Hash map solution', 'O(n) time complexity', 'Single pass approach', 'Edge cases handling'],
      },
      {
        content: 'Design an algorithm to find the shortest path in a weighted graph with non-negative edges.',
        category: 'algorithms',
        difficulty: 'hard',
        keyPoints: ["Dijkstra's algorithm", 'Priority queue usage', 'Graph representation', 'Time and space complexity analysis'],
      },
    ],
    system_design: [
      {
        content: 'Design a URL shortening service like TinyURL. What are the key considerations?',
        category: 'system_design',
        difficulty: 'medium',
        keyPoints: ['Hash function selection', 'Database schema', 'Scale considerations', 'Redirection flow'],
      },
      {
        content: 'How would you design a distributed rate limiter? Compare different algorithms.',
        category: 'system_design',
        difficulty: 'hard',
        keyPoints: ['Token bucket algorithm', 'Sliding window', 'Distributed coordination', 'Redis implementation'],
      },
      {
        content: 'Design a notification system that can handle millions of push notifications per day.',
        category: 'system_design',
        difficulty: 'medium',
        keyPoints: ['Message queue architecture', 'Push vs pull', 'Retry mechanism', 'Delivery guarantees'],
      },
    ],
    frontend: [
      {
        content: 'Explain React\'s reconciliation algorithm and how keys help optimize rendering.',
        category: 'frontend',
        difficulty: 'medium',
        keyPoints: ['Virtual DOM diffing', 'Key-based matching', 'Component lifecycle', 'Performance optimization'],
      },
      {
        content: 'Describe CSS Grid and Flexbox differences. When would you use one over the other?',
        category: 'frontend',
        difficulty: 'easy',
        keyPoints: ['1D vs 2D layouts', 'Content-first vs layout-first', 'Browser support', 'Common use cases'],
      },
      {
        content: 'How would you implement state management in a large React application? Compare Redux, Zustand, and Context API.',
        category: 'frontend',
        difficulty: 'hard',
        keyPoints: ['Global vs local state', 'Performance considerations', 'Middleware and side effects', 'Scalability patterns'],
      },
    ],
    backend: [
      {
        content: 'Explain RESTful API design principles. What makes a good API?',
        category: 'backend',
        difficulty: 'easy',
        keyPoints: ['Resource naming conventions', 'HTTP methods usage', 'Status codes', 'Versioning strategies'],
      },
      {
        content: 'How would you design a database schema for a multi-tenant SaaS application?',
        category: 'backend',
        difficulty: 'medium',
        keyPoints: ['Isolation strategies', 'Tenant identification', 'Shared vs separate databases', 'Migration considerations'],
      },
      {
        content: 'Implementing a message queue: compare RabbitMQ, Kafka, and Redis Streams. When would you choose each?',
        category: 'backend',
        difficulty: 'hard',
        keyPoints: ['Message persistence', 'Throughput characteristics', 'Consumer groups', 'Use case fit'],
      },
    ],
    behavioral: [
      {
        content: 'Tell me about a time you had a conflict with a team member. How did you resolve it?',
        category: 'behavioral',
        difficulty: 'medium',
        keyPoints: ['STAR method', 'Communication approach', 'Resolution steps', 'Outcome and learning'],
      },
      {
        content: 'Describe a project you led from start to finish. What challenges did you face?',
        category: 'behavioral',
        difficulty: 'easy',
        keyPoints: ['Project scope', 'Leadership role', 'Technical decisions', 'Success metrics'],
      },
      {
        content: 'Tell me about a situation where you had to learn a new technology quickly to meet a deadline.',
        category: 'behavioral',
        difficulty: 'medium',
        keyPoints: ['Learning approach', 'Time management', 'Applied knowledge', 'Result and impact'],
      },
    ],
  };

  getQuestionsByCategory(category: string): QuestionPreset[] {
    return this.presets[category] || [];
  }

  getQuestionsByDifficulty(difficulty: string): QuestionPreset[] {
    const result: QuestionPreset[] = [];
    for (const cat of Object.keys(this.presets)) {
      for (const q of this.presets[cat]) {
        if (q.difficulty === difficulty) {
          result.push(q);
        }
      }
    }
    return result;
  }

  getAllPresets(): Record<string, QuestionPreset[]> {
    return this.presets;
  }

  generateSeedQuestions(): QuestionPreset[] {
    const all: QuestionPreset[] = [];
    for (const cat of Object.keys(this.presets)) {
      all.push(...this.presets[cat]);
    }
    return all;
  }
}
