export function getReadingTime(content: string = ''): string {
  // Strip code blocks and HTML tags for a cleaner word count
  const cleanText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]*>/g, '');

  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);

  return `${Math.max(1, minutes)} MIN READ`;
}