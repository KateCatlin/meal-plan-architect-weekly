/**
 * Security utilities for input validation and sanitization
 */

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates if a string is a valid UUID
 */
export const isValidUUID = (value: string): boolean => {
  return UUID_REGEX.test(value);
};

/**
 * Validates if a string is a valid email
 */
export const isValidEmail = (value: string): boolean => {
  return EMAIL_REGEX.test(value);
};

/**
 * Sanitizes text input by removing dangerous characters
 */
export const sanitizeText = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

/**
 * Validates and sanitizes user input for forms
 */
export const validateFormInput = (data: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for required fields
  if (data.userId && !isValidUUID(data.userId)) {
    errors.push('Invalid user ID format');
  }
  
  // Validate text fields
  if (data.feedback && typeof data.feedback === 'string' && data.feedback.length > 1000) {
    errors.push('Feedback text is too long (max 1000 characters)');
  }
  
  // Validate arrays
  if (data.restrictions && !Array.isArray(data.restrictions)) {
    errors.push('Restrictions must be an array');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Rate limiting utility (simple in-memory implementation)
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const userRequests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Security logging utility
 */
export const logSecurityEvent = (event: string, userId?: string, details?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId: userId || 'anonymous',
    details: details || {},
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };
  
  console.warn('Security Event:', logEntry);
  
  // In production, this would send to a logging service
  // For now, we'll just log to console
};

/**
 * Content Security Policy violation handler
 */
export const handleCSPViolation = (violation: any) => {
  logSecurityEvent('CSP_VIOLATION', undefined, {
    directive: violation.violatedDirective,
    blockedUri: violation.blockedURI,
    sourceFile: violation.sourceFile,
    lineNumber: violation.lineNumber
  });
};

// Set up CSP violation listener if in browser
if (typeof window !== 'undefined') {
  window.addEventListener('securitypolicyviolation', handleCSPViolation);
}