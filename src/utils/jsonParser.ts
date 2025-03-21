/**
 * Enhanced JSON parser with robust error handling
 * Safely parses potentially malformed JSON into an object
 */

/**
 * Parse JSON string with enhanced error handling
 * @param jsonStr The JSON string to parse
 * @returns Parsed object
 */
export function safeJsonParse(jsonStr: string | any): any {
  // If already an object, return as is
  if (typeof jsonStr === 'object') {
    return jsonStr;
  }
  
  // Safety check for empty or invalid input
  if (!jsonStr || jsonStr === '{}' || jsonStr === 'null' || jsonStr === 'undefined') {
    return { empty: true };
  }
  
  try {
    // First attempt: parse as-is
    return JSON.parse(jsonStr);
  } catch (e) {
    // Log the original string for debugging
    console.log('Attempting to clean and parse:', jsonStr);
    
    try {
      // Python-style dict format detection (using single quotes)
      if (jsonStr.indexOf("'") !== -1 && jsonStr.indexOf("{'") !== -1) {
        // Handle nested quotes in the string that might cause problems
        // First, process sections with potential problematic quotes
        const sections = jsonStr.split("'");
        
        // If we have an odd number of single quotes, it's likely unbalanced
        if (sections.length % 2 === 0) {
          console.warn('Unbalanced quotes in JSON string');
        }
        
        // Handle the text specifically for our stage description
        // Extract each key-value pair manually for Python-like dictionaries
        const result: Record<string, any> = {};
        
        // Extract stage number
        const stageMatch = jsonStr.match(/'階段'\s*:\s*(\d+)/);
        if (stageMatch) {
          result['階段'] = parseInt(stageMatch[1], 10);
        }
        
        // Extract stage description
        const stageDescMatch = jsonStr.match(/'階段描述'\s*:\s*'([^']+)'/);
        if (stageDescMatch) {
          result['階段描述'] = stageDescMatch[1];
        }
        
        // Extract current customer status
        const statusMatch = jsonStr.match(/'當前客戶狀態描述'\s*:\s*'([^']+)'/);
        if (statusMatch) {
          result['當前客戶狀態描述'] = statusMatch[1];
        }
        
        // Extract entry conditions - this is more complex due to nested quotes
        // First identify the section to avoid regex problems
        const startIdx = jsonStr.indexOf("'進入下一階段條件'");
        if (startIdx !== -1) {
          let endIdx = jsonStr.indexOf("'}", startIdx);
          if (endIdx === -1) {
            endIdx = jsonStr.indexOf("'}", startIdx);
          }
          
          if (endIdx !== -1) {
            const conditionSection = jsonStr.substring(startIdx, endIdx + 2);
            // Now extract the actual value
            const condMatch = conditionSection.match(/'進入下一階段條件'\s*:\s*'(.+?)(?=',\s*'|'$)/s);
            if (condMatch) {
              // Replace escaped quotes
              result['進入下一階段條件'] = condMatch[1].replace(/\\'/g, "'");
            } else {
              // Try a more general pattern
              const generalMatch = conditionSection.match(/'進入下一階段條件'\s*:\s*'(.+)'/s);
              if (generalMatch) {
                result['進入下一階段條件'] = generalMatch[1].replace(/\\'/g, "'");
              }
            }
          }
        }
        
        // If we found any keys, return the result
        if (Object.keys(result).length > 0) {
          console.log('Extracted result from Python-style dict:', result);
          return result;
        }
      }
      
      // Standard JSON cleaning as fallback
      let cleanedJson = jsonStr
        .replace(/'/g, '"') // Replace single quotes
        .replace(/([{,]\s*)([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*:/g, '$1"$2":') // Fix unquoted keys
        .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas in arrays and objects
        .replace(/\(/g, '[').replace(/\)/g, ']') // Replace parentheses with brackets
        .replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']'); // Remove trailing commas
      
      console.log('Cleaned JSON:', cleanedJson);
      
      // Try to parse the cleaned JSON
      return JSON.parse(cleanedJson);
    } catch (parseError) {
      console.warn('Enhanced JSON parsing failed:', parseError);
      
      // Direct string extraction as a final fallback
      const result: Record<string, any> = { error: 'Parse error' };
      
      // Try to match the structure from our example
      // Extract stage number
      const stageMatch = jsonStr.match(/'階段'\s*:\s*(\d+)/);
      if (stageMatch) {
        result['階段'] = parseInt(stageMatch[1], 10);
      }
      
      // Extract common field patterns regardless of quote type
      const stageDescPattern = /['"]?階段描述['"]?\s*[:=]\s*['"]?([^'"]+)['"]?/;
      const stageDescMatch = jsonStr.match(stageDescPattern);
      if (stageDescMatch) {
        result['階段描述'] = stageDescMatch[1];
      }
      
      const statusPattern = /['"]?當前客戶狀態描述['"]?\s*[:=]\s*['"]?([^'"]+)['"]?/;
      const statusMatch = jsonStr.match(statusPattern);
      if (statusMatch) {
        result['當前客戶狀態描述'] = statusMatch[1];
      }
      
      // Extract a long value that may contain quoted text
      // Use a more flexible pattern
      const conditionPattern = /['"]?進入下一階段條件['"]?\s*[:=]\s*['"]?(.*?)(?=['"]?[\s,}])/;
      const conditionMatch = jsonStr.match(conditionPattern);
      if (conditionMatch) {
        // Clean up the extracted text
        let condition = conditionMatch[1];
        // Remove excess quotes and backslashes
        condition = condition.replace(/\\'/g, "'").replace(/\\/g, "");
        result['進入下一階段條件'] = condition;
      }
      
      // Remove error if we found any data
      if (Object.keys(result).length > 1) {
        delete result.error;
      }
      
      console.log('Final fallback extraction result:', result);
      return result;
    }
  }
}
