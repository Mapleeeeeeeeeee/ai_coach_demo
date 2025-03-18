/**
 * Get an element by ID with type safety
 * @param id - The ID of the element to get
 * @returns The element with the specified ID
 * @throws Error if the element is not found
 */
export function getElement<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T;
  if (!element) {
    throw new Error(`Element with ID "${id}" not found`);
  }
  return element;
}

/**
 * Toggle a class on an element
 * @param element - The element to toggle the class on
 * @param className - The class to toggle
 * @returns Whether the class is now present
 */
export function toggleClass(element: HTMLElement, className: string): boolean {
  return element.classList.toggle(className);
}

/**
 * Create a new HTML element with specified attributes
 * @param tag - The tag name for the element
 * @param options - Options for the element
 * @returns The created element
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    className?: string;
    id?: string;
    innerHTML?: string;
    textContent?: string;
    attributes?: Record<string, string>;
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  
  if (options?.className) {
    element.className = options.className;
  }
  
  if (options?.id) {
    element.id = options.id;
  }
  
  if (options?.innerHTML !== undefined) {
    element.innerHTML = options.innerHTML;
  }
  
  if (options?.textContent !== undefined) {
    element.textContent = options.textContent;
  }
  
  if (options?.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value);
    }
  }
  
  return element;
}

/**
 * Format a date to a localized string
 * @param date - The date to format
 * @returns The formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Add CSS styles to the document
 * @param css - The CSS string to add
 */
export function addStyles(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}
