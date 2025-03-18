/**
 * Formats message content with improved styling and markdown-like parsing
 * 
 * @param content The raw message content
 * @returns Formatted HTML content
 */
export function formatMessageContent(content: string): string {
  if (!content) return '';
  
  let formattedContent = content;
  
  // Convert URLs to clickable links
  formattedContent = formattedContent.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  
  // Convert markdown-style bold (**text**) to HTML bold
  formattedContent = formattedContent.replace(
    /\*\*(.*?)\*\*/g,
    '<strong>$1</strong>'
  );
  
  // Convert markdown-style italic (*text*) to HTML italic
  formattedContent = formattedContent.replace(
    /\*(.*?)\*/g,
    '<em>$1</em>'
  );
  
  // Convert markdown-style code blocks (```code```) to HTML pre
  formattedContent = formattedContent.replace(
    /```([\s\S]*?)```/g,
    '<pre class="code-block">$1</pre>'
  );
  
  // Convert markdown-style inline code (`code`) to HTML code
  formattedContent = formattedContent.replace(
    /`([^`]+)`/g,
    '<code>$1</code>'
  );
  
  // Convert markdown-style headings (# Heading) to HTML h tags
  formattedContent = formattedContent.replace(
    /^# (.*?)$/gm,
    '<h3>$1</h3>'
  );
  
  formattedContent = formattedContent.replace(
    /^## (.*?)$/gm,
    '<h4>$1</h4>'
  );
  
  // Convert markdown-style unordered lists
  formattedContent = formattedContent.replace(
    /^- (.*?)$/gm,
    '• $1'
  );

  // Convert multiple newlines to paragraph breaks
  formattedContent = formattedContent
    .replace(/\n\s*\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '$1<br>');
  
  // Wrap in paragraph tags if not already
  if (!formattedContent.startsWith('<p>')) {
    formattedContent = '<p>' + formattedContent;
  }
  
  if (!formattedContent.endsWith('</p>')) {
    formattedContent = formattedContent + '</p>';
  }
  
  return formattedContent;
}
