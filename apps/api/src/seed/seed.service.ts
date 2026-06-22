import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { InterviewSession } from '../interviews/entities/interview.entity';
import { Question } from '../questions/entities/question.entity';
import { Answer } from '../answers/entities/answer.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { QuestionGeneratorAgent } from '../questions/agents/question-generator.agent';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(InterviewSession)
    private interviewsRepository: Repository<InterviewSession>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    private questionGenerator: QuestionGeneratorAgent,
  ) {}

  async onApplicationBootstrap() {
    const existingUsers = await this.usersRepository.count();
    if (existingUsers > 0) {
      this.logger.log('Seed data already exists, skipping...');
      return;
    }
    this.logger.log('Seeding database with demo data...');
    await this.seed();
    this.logger.log('Database seeded successfully!');
  }

  private async seed() {
    // Create demo users
    const demoPassword = await bcrypt.hash('demo1234', 10);
    const adminPassword = await bcrypt.hash('admin1234', 10);

    const user1 = this.usersRepository.create({
      email: 'demo@example.com',
      password: demoPassword,
      name: 'Demo User',
    });
    const savedUser1 = await this.usersRepository.save(user1);

    const user2 = this.usersRepository.create({
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
    });
    const savedUser2 = await this.usersRepository.save(user2);

    this.logger.log(`Created users: ${savedUser1.email}, ${savedUser2.email}`);

    // Create 3 interview sessions for user1
    const interview1 = await this.interviewsRepository.save(
      this.interviewsRepository.create({
        role: 'fullstack',
        seniority: 'mid',
        type: 'mixed',
        technologies: JSON.stringify(['React', 'Node.js', 'TypeScript']),
        targetCompany: 'Google',
        status: 'completed',
        totalQuestions: 5,
        avgScore: 7.2,
        duration: 1800,
        user: { id: savedUser1.id },
      }),
    );

    const interview2 = await this.interviewsRepository.save(
      this.interviewsRepository.create({
        role: 'frontend',
        seniority: 'senior',
        type: 'technical',
        technologies: JSON.stringify(['React', 'TypeScript', 'CSS']),
        status: 'completed',
        totalQuestions: 5,
        avgScore: 6.8,
        duration: 1500,
        user: { id: savedUser1.id },
      }),
    );

    const interview3 = await this.interviewsRepository.save(
      this.interviewsRepository.create({
        role: 'backend',
        seniority: 'mid',
        type: 'technical',
        technologies: JSON.stringify(['Node.js', 'PostgreSQL', 'Redis']),
        status: 'draft',
        totalQuestions: 5,
        user: { id: savedUser1.id },
      }),
    );

    this.logger.log(`Created 3 interview sessions`);

    // Create 15 seed questions (3 per category)
    const presets = this.questionGenerator.generateSeedQuestions();
    const questions: Question[] = [];
    const categories = ['algorithms', 'system_design', 'frontend', 'backend', 'behavioral'];

    let orderIndex = 0;
    for (const category of categories) {
      const catPresets = presets.filter((p) => p.category === category).slice(0, 3);
      for (const preset of catPresets) {
        const question = this.questionsRepository.create({
          content: preset.content,
          category: preset.category,
          difficulty: preset.difficulty,
          orderIndex: orderIndex++,
          timeLimit: 180,
          keyPoints: JSON.stringify(preset.keyPoints),
          interview: { id: interview1.id },
        });
        questions.push(question);
      }
    }
    const savedQuestions = await this.questionsRepository.save(questions);
    this.logger.log(`Created ${savedQuestions.length} seed questions`);

    // Create 6 answers with feedback for interview1 (completed)
    const answerContents = [
      {
        content: `The LRU (Least Recently Used) cache is an eviction policy that removes the least recently accessed items when the cache reaches its capacity. 

I would implement this using a combination of a HashMap and a Doubly Linked List. The HashMap provides O(1) lookup by key, while the Doubly Linked List maintains the order of access. When an item is accessed, it moves to the front of the list. When the cache is full, the item at the tail is evicted.

\`\`\`typescript
class LRUCache {
  private capacity: number;
  private cache: Map<number, DoublyLinkedListNode>;
  private head: DoublyLinkedListNode;
  private tail: DoublyLinkedListNode;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const node = this.cache.get(key);
    this.moveToFront(node);
    return node.value;
  }
}
\`\`\`

This approach gives O(1) time complexity for both get and put operations, which is the most efficient solution.`,
        questionCategory: 'algorithms',
      },
      {
        content: `For designing a URL shortening service, I would consider:

1. **Hash Function**: Use Base62 encoding to generate short URLs from unique IDs. This gives 62^7 possible combinations.
2. **Database**: Use a key-value store like Redis for frequently accessed URLs with a SQL database for persistence.
3. **Redirection**: HTTP 301 redirects for permanent URLs, 302 for analytics tracking.
4. **Scale**: Implement consistent hashing across multiple servers.

The key challenges are avoiding collisions and handling high read throughput. Using a distributed cache layer helps with the latter.`,
        questionCategory: 'system_design',
      },
      {
        content: `React's reconciliation algorithm (the "diffing" algorithm) works by comparing the Virtual DOM tree with its previous version to determine what changed.

Keys play a crucial role in this process. When rendering lists, keys help React identify which items have changed, been added, or removed. Without keys, React would re-render all list items, causing unnecessary DOM operations.

\`\`\`tsx
// With keys - efficient reconciliation
{items.map(item => <ListItem key={item.id} data={item} />)}
\`\`\`

Using stable, unique keys (like database IDs) instead of array indices allows React to maintain component state correctly during reordering.`,
        questionCategory: 'frontend',
      },
      {
        content: `Good RESTful API design follows these principles:

1. **Resource-based URLs**: /api/users, /api/users/:id, /api/users/:id/orders
2. **HTTP methods**: GET for retrieval, POST for creation, PUT/PATCH for updates, DELETE for removal
3. **Status codes**: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error
4. **Versioning**: Prefix URLs with /v1/, /v2/ or use Accept headers
5. **Pagination**: Use limit/offset or cursor-based pagination for collections
6. **Error handling**: Consistent error format with message, code, and details

A well-designed API is intuitive, consistent, and follows established conventions that developers expect.`,
        questionCategory: 'backend',
      },
      {
        content: `In a previous role, I disagreed with a teammate about the architecture for a new microservice. They wanted a monolithic approach, while I believed we needed separate services for scalability.

I scheduled a meeting and prepared a comparison document showing the trade-offs of each approach. We discussed factors like team size, deployment frequency, and future scaling needs.

We compromised by starting with a modular monolith with clear bounded contexts, with the option to split into microservices later as the team grew. This approach reduced initial complexity while keeping the door open for future scaling.

The result was a system that started shipping within weeks and successfully split into three services a year later when the team doubled in size.`,
        questionCategory: 'behavioral',
      },
      {
        content: `For finding two numbers that sum to a target, the most efficient approach uses a hash map:

\`\`\`typescript
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
\`\`\`

This is O(n) time complexity with a single pass, and O(n) space for the hash map. The brute force approach would be O(n²). Edge cases include duplicate values and negative numbers.`,
        questionCategory: 'algorithms',
      },
    ];

    for (let i = 0; i < answerContents.length; i++) {
      const { content, questionCategory } = answerContents[i];
      const matchingQuestion = savedQuestions.find(
        (q) => q.category === questionCategory && !q.answer,
      );
      if (!matchingQuestion) continue;

      const answer = this.answersRepository.create({
        content,
        timeSpent: 180 + Math.floor(Math.random() * 120),
        autoSubmitted: false,
        question: { id: matchingQuestion.id },
        user: { id: savedUser1.id },
      });
      const savedAnswer = await this.answersRepository.save(answer);

      // Create feedback for each answer
      const scores = [
        { overall: 7.5, structure: 8.0, clarity: 7.5, depth: 7.0, examples: 8.0, keywords: 7.0 },
        { overall: 6.5, structure: 7.0, clarity: 6.5, depth: 6.0, examples: 6.5, keywords: 6.5 },
        { overall: 8.0, structure: 8.5, clarity: 8.0, depth: 7.5, examples: 8.5, keywords: 7.5 },
        { overall: 7.0, structure: 7.5, clarity: 7.0, depth: 6.5, examples: 7.0, keywords: 7.0 },
        { overall: 7.5, structure: 7.0, clarity: 8.0, depth: 7.5, examples: 7.5, keywords: 7.5 },
        { overall: 8.5, structure: 8.0, clarity: 8.5, depth: 8.5, examples: 8.0, keywords: 9.0 },
      ];

      const score = scores[i % scores.length];
      const feedback = this.feedbackRepository.create({
        overallScore: score.overall,
        structureScore: score.structure,
        clarityScore: score.clarity,
        depthScore: score.depth,
        examplesScore: score.examples,
        keywordsScore: score.keywords,
        strengths: JSON.stringify([
          'Good use of technical terminology',
          'Clear answer structure',
          'Practical code examples provided',
        ]),
        improvements: JSON.stringify([
          'Could add more edge case analysis',
          'Consider discussing trade-offs in more detail',
        ]),
        sampleAnswer: 'A comprehensive answer would cover the key aspects systematically with concrete examples.',
        resources: JSON.stringify([
          { title: 'Relevant Documentation', url: 'https://example.com/docs' },
        ]),
        modelUsed: 'local',
        answer: { id: savedAnswer.id },
      });
      await this.feedbackRepository.save(feedback);
    }

    this.logger.log('Created 6 answers with feedback');
  }
}
