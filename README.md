# TeacherBean - AI-Powered English Teaching Platform

TeacherBean is a comprehensive English teaching platform that leverages AI to help educators create lesson plans, reading materials, assessments, and interactive content. Built with Next.js 14, TypeScript, and Supabase.

## Features

### 🎯 Core Modules

1. **Lesson Planning (/plan)**
   - AI-generated lesson plans with CEFR alignment
   - Customizable duration, topics, and focus skills
   - Structured activities with timing and materials
   - Export to PDF and save to library

2. **Reading Materials (/reading)**
   - Adaptive reading passages based on level and topic
   - Vocabulary definitions and pronunciation guides
   - Comprehension questions (MCQ, short answer, matching)
   - Difficulty adjustment and cultural context

3. **Dialog Practice (/dialog)**
   - Scenario-based conversation cards
   - Role-play activities for different situations
   - CEFR level adaptation (A1-B1)
   - Pronunciation tips and cultural notes

4. **Quick Games (/game)**
   - Vocabulary spelling challenges
   - Sentence matching exercises
   - Rapid-fire Q&A sessions
   - Real-time scoring and accuracy tracking

5. **Writing Assistant (/writing)**
   - Writing task generation with prompts
   - AI-powered feedback with rubric scoring
   - Detailed improvement suggestions
   - One-click revision generation

6. **Assessment Hub (/assess)**
   - Unified question bank (MCQ, cloze, error correction, etc.)
   - Auto-grading with detailed analytics
   - Test builder with difficulty/topic filtering
   - Student progress tracking dashboard

7. **Library (/library)**
   - Personal and shared material collections
   - Template system with permissions
   - Search and filtering capabilities
   - Version control and collaboration

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth with RLS
- **UI Components**: Custom components with Tailwind
- **Testing**: Playwright for E2E testing
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- OpenAI API key (for AI generation)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd teacherbean
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase and OpenAI credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Set up Supabase database**:
   ```bash
   # Run the schema creation script in your Supabase SQL editor
   # Execute the contents of supabase/schema.sql
   # Optionally run supabase/seed.sql for sample data
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

5. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **profiles**: User accounts with role-based access
- **classes**: Teacher's classes with student management
- **students**: Student records with privacy encryption
- **materials**: Lesson plans, reading materials, templates
- **items**: Test questions and exercise bank
- **assignments**: Quizzes, homework, writing tasks
- **submissions**: Student responses and grading
- **writings**: Writing assignments with AI feedback
- **learning_analytics**: Performance tracking data

## API Endpoints

### Generation APIs
- `POST /api/generate/lesson` - Generate lesson plans
- `POST /api/generate/reading` - Create reading materials
- `POST /api/generate/items` - Generate test questions

### Data APIs
- `GET/POST /api/materials` - Material management
- `GET/POST /api/assignments` - Assignment handling
- `GET/POST /api/submissions` - Submission processing

## Sample Data Examples

### 1. Test Item (MCQ)
```json
{
  "type": "mcq",
  "level": "A2",
  "stem": "I _____ to London last year.",
  "options": ["go", "went", "gone", "going"],
  "answer": 1,
  "explanation": "Past simple tense for completed past actions",
  "tags": ["grammar", "past_simple", "irregular_verbs"],
  "difficulty_score": 0.6
}
```

### 2. Test Item (Cloze)
```json
{
  "type": "cloze",
  "level": "A1",
  "stem": "Fill in the blanks: I _____ (be) a student. I _____ (have) many friends.",
  "answer": ["am", "have"],
  "explanation": "Present simple with 'be' and 'have'",
  "tags": ["grammar", "present_simple", "be_have"]
}
```

### 3. Test Item (Matching)
```json
{
  "type": "matching",
  "level": "A1",
  "stem": "Match the times:",
  "options": {
    "left": ["7:00", "12:00", "6:00 PM", "9:30"],
    "right": ["half past nine", "seven o'clock", "six in the evening", "noon"]
  },
  "answer": [[0,1], [1,3], [2,2], [3,0]],
  "tags": ["vocabulary", "time", "daily_routine"]
}
```

### 4. Test Item (Error Correction)
```json
{
  "type": "error_correction",
  "level": "B1",
  "stem": "Find and correct the error: 'She don't like coffee very much.'",
  "answer": "She doesn't like coffee very much.",
  "explanation": "Use 'doesn't' with third person singular",
  "tags": ["grammar", "present_simple", "negation"]
}
```

### 5. Writing Rubric Example
```json
{
  "criteria": [
    {
      "name": "Content & Ideas",
      "weight": 25,
      "levels": [
        {"score": 4, "description": "Ideas are clear, well-developed, and engaging"},
        {"score": 3, "description": "Ideas are clear and adequately developed"},
        {"score": 2, "description": "Ideas are somewhat clear but need development"},
        {"score": 1, "description": "Ideas are unclear or poorly developed"}
      ]
    },
    {
      "name": "Language Use",
      "weight": 30,
      "levels": [
        {"score": 4, "description": "Excellent grammar and vocabulary"},
        {"score": 3, "description": "Good grammar with minor errors"},
        {"score": 2, "description": "Some errors that don't impede understanding"},
        {"score": 1, "description": "Frequent errors that impede understanding"}
      ]
    }
  ],
  "total_points": 100
}
```

## Performance & Accessibility Standards

### 🚀 Performance Baselines

The application maintains strict performance standards:

- **Core Web Vitals**:
  - Largest Contentful Paint (LCP) < **2.5s** (cold start)
  - First Input Delay (FID) < **100ms**
  - Cumulative Layout Shift (CLS) < **0.1**

- **Interaction Responsiveness**:
  - Form interactions < **200ms** response time
  - Navigation transitions < **300ms**
  - Search/filter operations < **500ms**

- **Load Performance**:
  - Time to Interactive (TTI) < **3.5s**
  - First Contentful Paint (FCP) < **1.8s**
  - Speed Index < **3.0s**

### ♿ Accessibility Requirements (WCAG AA Compliance)

All components meet accessibility standards:

**Form Controls & Labels**:
- ✅ All form inputs have associated `<label>` elements
- ✅ Error messages use `aria-errormessage` attributes
- ✅ Required fields marked with `aria-required="true"`
- ✅ Form validation provides clear, actionable feedback

**Keyboard Navigation**:
- ✅ All interactive elements accessible via keyboard
- ✅ Logical tab order throughout the application
- ✅ Focus indicators clearly visible (outline: 2px solid #0066cc)
- ✅ Skip links for main content navigation

**Visual Design**:
- ✅ Color contrast ratios ≥ **4.5:1** for normal text
- ✅ Color contrast ratios ≥ **3:1** for large text (18pt+)
- ✅ Information not conveyed by color alone
- ✅ Text remains readable at 200% zoom

**Mobile Responsiveness**:
- ✅ Responsive design down to **375px width**
- ✅ Touch targets ≥ **44px** minimum size
- ✅ Content reflows without horizontal scrolling
- ✅ Text scales appropriately for mobile viewports

### 📱 Mobile Compatibility Checklist

**Viewport & Layout**:
- [ ] Content fits within 375px width without horizontal scroll
- [ ] Navigation menu optimized for touch interactions
- [ ] Form fields sized appropriately for mobile input
- [ ] Tables/data grids responsive with horizontal scroll if needed

**Touch Interaction**:
- [ ] Touch targets minimum 44x44px with adequate spacing
- [ ] Hover states have touch-friendly alternatives
- [ ] Swipe gestures work where expected (carousels, etc.)
- [ ] Long-press actions are discoverable

**Performance on Mobile**:
- [ ] Images optimized and use appropriate formats (WebP, AVIF)
- [ ] JavaScript bundles code-split for faster initial loads
- [ ] Critical CSS inlined for above-the-fold content
- [ ] Service worker caches essential resources

### 🔍 Lighthouse Auditing

Run comprehensive Lighthouse audits:

```bash
# Install Lighthouse CLI
pnpm install -D lighthouse

# Run full Lighthouse audit
pnpm audit:lighthouse

# Run specific category audits
pnpm audit:lighthouse --only-categories=performance
pnpm audit:lighthouse --only-categories=accessibility
pnpm audit:lighthouse --only-categories=best-practices
pnpm audit:lighthouse --only-categories=seo
```

**Target Lighthouse Scores**:
- Performance: **≥ 90**
- Accessibility: **≥ 95**
- Best Practices: **≥ 90**
- SEO: **≥ 90**

## Testing

Run the test suite:

```bash
# Install Playwright browsers
npx playwright install

# Run all tests
pnpm test

# Run unit tests with Vitest
pnpm test:unit

# Run tests with UI
pnpm test:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run Lighthouse performance audit
pnpm audit:lighthouse
```

### E2E Test User Stories

1. **Teacher Registration and Login**
   - User signs up with school information
   - Email verification process
   - Login with dashboard access

2. **Lesson Plan Creation**
   - Fill lesson planning form
   - Generate AI-powered lesson plan
   - Save to library and export PDF

3. **Assessment Workflow**
   - Create quiz with question bank
   - Publish to class
   - Review student submissions and analytics

## Deployment

### Vercel Deployment

1. **Connect repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: Automatic on git push

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Supabase Setup for Production

1. Create production Supabase project
2. Run schema.sql in SQL editor
3. Configure RLS policies
4. Set up authentication providers
5. Configure CORS for your domain

## Security Features

- **Row Level Security (RLS)** on all tables
- **Role-based access control** (admin/teacher)
- **Encrypted student data** for privacy
- **Secure API endpoints** with authentication
- **Input validation** and sanitization

## Performance Monitoring & CI Integration

### 🔄 Continuous Integration

The project includes automated performance and accessibility checks:

```bash
# Local development checks
pnpm audit:lighthouse              # Full Lighthouse audit
pnpm accessibility:check           # WCAG AA compliance check
pnpm perf:lighthouse-dev          # Auto-start server and audit

# CI-optimized checks
pnpm audit:lighthouse:ci          # CI-friendly thresholds
```

### 📈 Performance Budget

The following performance budgets are enforced in CI:

| Metric | Development | CI | Production Target |
|--------|-------------|-----|------------------|
| Performance Score | ≥90 | ≥85 | ≥95 |
| Accessibility Score | ≥95 | ≥95 | ≥98 |
| LCP | <2.5s | <3.0s | <2.0s |
| FID | <100ms | <150ms | <75ms |
| CLS | <0.1 | <0.15 | <0.05 |

### 🔍 Monitoring in Production

Consider implementing:
- **Real User Monitoring (RUM)** with Web Vitals API
- **Synthetic monitoring** with scheduled Lighthouse audits
- **Error tracking** with performance context
- **Accessibility monitoring** with automated WCAG checks

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. **Run performance checks**: `pnpm audit:lighthouse` before committing
4. **Verify accessibility**: `pnpm accessibility:check` before committing
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open Pull Request (CI will run automated audits)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**TeacherBean** - Empowering educators with AI-driven teaching tools 🚀# Deploy trigger
