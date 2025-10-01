# TeacherBean Project - Claude Code Context

## Project Overview
TeacherBean is a comprehensive AI-powered English teaching platform built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## Key Technologies
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Authentication**: Supabase Auth with Row Level Security
- **Testing**: Playwright for E2E testing
- **Deployment**: Vercel

## Commands to Run
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Important Notes for Claude Code
- This is a functional MVP with all core modules implemented
- Database schema is in `supabase/schema.sql` - run this in Supabase SQL editor
- Environment variables needed in `.env.local` (see `.env.example`)
- All modules have working UI but API calls are mocked for demo
- Real OpenAI integration would replace mock API responses
- Ready for `pnpm i && pnpm dev` after environment setup

## Module Structure
- `/plan` - AI lesson plan generation
- `/reading` - Reading material creation with comprehension questions
- `/dialog` - Interactive conversation scenarios
- `/game` - Vocabulary and grammar mini-games
- `/writing` - AI writing feedback with rubrics
- `/assess` - Test creation and analytics
- `/library` - Material management and templates

## Key Features Implemented
✅ Complete authentication flow with role-based access
✅ Responsive dashboard with navigation
✅ All 7 core teaching modules with functional UI
✅ Supabase integration with RLS policies
✅ Type-safe database schema and API routes
✅ Comprehensive test structure
✅ Production-ready deployment configuration