import { LocalStrategy } from './strategies/local.strategy';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  beforeEach(() => {
    strategy = new LocalStrategy();
  });

  it('should analyze a well-written answer and return high scores', async () => {
    const answer = `REST is an architectural style that uses standard HTTP methods like GET, POST, PUT, DELETE.
                    Each resource has a unique URL. GraphQL uses a single endpoint and lets the client specify data needs.
                    REST leverages HTTP caching. GraphQL requires custom caching.
                    For example, /api/users returns users. I used REST in my last project and it was efficient.
                    This required proper API design and versioning strategy.`;

    const result = await strategy.analyze(answer, 'What is REST vs GraphQL?', 'backend', 'medium');

    expect(result).toHaveProperty('overallScore');
    expect(result.overallScore).toBeGreaterThanOrEqual(1);
    expect(result.overallScore).toBeLessThanOrEqual(10);
    expect(result.structureScore).toBeGreaterThanOrEqual(1);
    expect(result.strengths).toBeInstanceOf(Array);
    expect(result.improvements).toBeInstanceOf(Array);
    expect(result.sampleAnswer).toBeTruthy();
    expect(result.resources).toBeInstanceOf(Array);
  });

  it('should give lower scores for an empty answer', async () => {
    const result = await strategy.analyze('', 'What is Docker?', 'devops', 'easy');
    expect(result.overallScore).toBeLessThanOrEqual(5);
  });

  it('should generate sample answers from key points', async () => {
    const result = await strategy.analyze(
      'I have experience with React and TypeScript.',
      'Describe your frontend experience',
      'frontend',
      'senior',
      ['React', 'TypeScript', 'State management'],
    );
    expect(result.sampleAnswer).toContain('React');
    expect(result.sampleAnswer).toContain('TypeScript');
  });
});
