import { searchBusinessKnowledge } from './knowledge-search'

export async function buildBusinessKnowledgeContext(
  businessId: string,
  customerQuestion: string
): Promise<string> {
  const matches =
    await searchBusinessKnowledge(
      businessId,
      customerQuestion,
      5
    )

  if (matches.length === 0) {
    return ''
  }

  const sections = matches.map(
    (match, index) => {
      return [
        `KNOWLEDGE SECTION ${index + 1}`,
        `Similarity: ${match.similarity.toFixed(4)}`,
        match.content,
      ].join('\n')
    }
  )

  return [
    'BUSINESS KNOWLEDGE',
    '',
    'Use the following verified business information when answering the customer.',
    'Do not invent business details that are not supported by this information.',
    '',
    sections.join('\n\n---\n\n'),
  ].join('\n')
}
