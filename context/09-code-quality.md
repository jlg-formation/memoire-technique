## 1. Project Structure

- Use consistent folder organization
- Separate concerns (components, hooks, utilities, types)
- Use TailwindCSS recommended project guidelines
- Keep files under 300 lines of code and break into smaller files/functions/components as often as possible

## 2. TypeScript Rules

- Use strict mode
- Always define explicit types
- Avoid `any` type
- Use interfaces and type aliases
- Implement proper type narrowing

## 3. Code Quality

- Follow ESLint and Prettier configurations
- Keep functions small and focused (single responsibility)
- Write clean, readable, and maintainable code
- Use meaningful variable and function names
- Add JSDoc comments for complex logic

## 4. Performance Optimization

- Implement code splitting
- Use React.memo for component memoization
- Leverage useMemo and useCallback hooks
- Minimize unnecessary re-renders
- Use dynamic imports
- Keep components as small as possible

## 5. State Management

- Use Zustand for complex state management
- Split the store by business logic
- Avoid prop drilling
- Keep state immutable
- Centralize state logic

## 6. Data Fetching

- Use only OpenAI server to call the AI

## 7. Security Practices

- Validate and sanitize all user inputs using Zod
- Implement proper authentication checks using Supabase
- Use Supabase RLS (Row Level Security)
- Never expose sensitive information
- Use environment variables

## 8. Error Handling

- Create global error boundary
- Log errors with context
- Provide user-friendly error messages
- Handle async operations carefully
- Use try/catch blocks

## 9. Styling

- Use Tailwind CSS v4 utility classes
- Create reusable component styles
- Maintain consistent design system
- Implement responsive design
- Avoid inline styles

## 10. Testing

- Write unit tests for critical components
- Use Jest and React Testing Library
- Aim for high test coverage
- Test edge cases
- Mock external dependencies

## 13. Accessibility

- Follow WCAG guidelines
- Use semantic HTML
- Implement proper aria attributes
- Support keyboard navigation
- Test with screen readers
- All buttons must have "cursor-pointer"
- All buttons should use the button component of the project.

## 14. Internationalization

- Use next-18next for translations
- Support multiple language contexts
- Design with text expansion in mind
- Implement language switcher

## 15. Environment Configuration

- Use .env.local for local secrets
- Never commit sensitive information
- Use different env files per environment
- Validate environment variables
- always create a .gitignore file with .env\* and node_modules already setup

## 16. Instruction Rules

- Avoid having files over 300 lines of code. Refactor at that point.
- Create helper functions for small tasks
- Never add new libraries or dependencies without checking they exist first
- Don't update code that is not directly related to the task
- Never mock data for dev or prod
- Always check codebase for similar code and functionality before writing new code
