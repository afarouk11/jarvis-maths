import OpenAI from 'openai'

let client: OpenAI | null = null

function getClient() {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return client
}

export async function embedText(text: string): Promise<number[]> {
  const res = await getClient().embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // token safety limit
  })
  return res.data[0].embedding
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await getClient().embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map(t => t.slice(0, 8000)),
  })
  return res.data.map(d => d.embedding)
}

// Chunk text into ~400-token segments with overlap
export function chunkText(text: string, chunkSize = 1600, overlap = 200): string[] {
  const chunks: string[] = []
  let i = 0
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize))
    i += chunkSize - overlap
  }
  return chunks.filter(c => c.trim().length > 50)
}

// Classify which AQA topic a chunk most likely relates to
export function guessTopicSlug(text: string): string | null {
  const lower = text.toLowerCase()
  const map: [string[], string][] = [
    [['differentiat', 'dy/dx', 'gradient', 'tangent', 'normal to'], 'differentiation'],
    [['integrat', 'area under', '∫', 'definite integral', 'indefinite'], 'integration'],
    [['trigonometr', 'sin', 'cos', 'tan', 'radian', 'cosec', 'cot', 'sec'], 'trigonometry'],
    [['binomial', 'expansion', 'pascal'], 'binomial-expansion'],
    [['vector', 'position vector', 'scalar product'], 'vectors'],
    [['logarithm', 'ln', 'exponential', 'e^x'], 'exponentials-logarithms'],
    [['proof', 'conjecture', 'contradict', 'disprove'], 'proof'],
    [['sequence', 'series', 'arithmetic', 'geometric', 'sum to infinity'], 'sequences-series'],
    [['algebra', 'factor', 'quadratic', 'polynomial', 'remainder theorem'], 'algebra-functions'],
    [['probability', 'p(', 'bayes', 'conditional'], 'probability'],
    [['normal distribut', 'z-value', 'standardise'], 'normal-distribution'],
    [['hypothesis', 'significance', 'p-value', 'critical region'], 'hypothesis-testing'],
    [['kinematics', 'velocity', 'acceleration', 'displacement', 'suvat'], 'kinematics'],
    [['force', 'newton', 'resolv', 'friction', 'equilibrium'], 'forces-newtons-laws'],
    [['moment', 'torque', 'pivot', 'couple'], 'moments'],
  ]
  for (const [keywords, slug] of map) {
    if (keywords.some(k => lower.includes(k))) return slug
  }
  return null
}
