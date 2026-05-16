# Metrics Framework — PromptBudget

## North Star Metric

**Qualified leads per week** — leads who complete an audit showing $500+/mo in potential savings and enter their email.

This metric directly measures the value PromptBudget creates for Credex. It combines:
- Product usage (someone ran an audit)
- Product quality (the audit found real savings)
- Business value (they're a qualified Credex lead)

## Input Metrics

These are the levers we can pull to influence the North Star.

### 1. Traffic → Audits (Top of Funnel)

| Metric | Target | How to Improve |
|--------|--------|---------------|
| Weekly unique visitors | 500+ | Content distribution, SEO, social sharing |
| Visitor → Audit start rate | 40% | Landing page copy, trust signals, clear value prop |
| Audit completion rate | 75% | Form UX, fewer steps, auto-calculated costs |
| **Total weekly audits** | **150** | |

### 2. Audit Quality (Middle of Funnel)

| Metric | Target | How to Improve |
|--------|--------|---------------|
| Avg tools per audit | 3+ | Add more tools, prompt users |
| Avg monthly spend audited | $300+ | Target bigger teams, enterprise tools |
| % audits with savings >$100 | 60% | Improve audit logic, add more rules |
| % audits with savings >$500 | 25% | Target ICP (Series A+ teams) |

### 3. Conversion (Bottom of Funnel)

| Metric | Target | How to Improve |
|--------|--------|---------------|
| Results → Email capture rate | 25% | Better CTAs, show value before gate |
| Email → Credex consultation rate | 20% | Personalized outreach for >$500 leads |
| Consultation → Deal close rate | 40% | Sales team quality, Credex offer |

### 4. Engagement & Retention

| Metric | Target | How to Improve |
|--------|--------|---------------|
| Share rate (copy link or tweet) | 10% | Easy sharing, compelling OG tags |
| Return audit rate (repeat users) | 15% | Email reminders when pricing changes |
| Referral rate (new users from shared links) | 5% | Social proof, benchmark comparisons |

## Pivot Triggers

If these metrics consistently underperform, the product direction should change.

| Signal | Threshold | Action |
|--------|-----------|--------|
| Audit completion rate < 50% | 2 weeks | Simplify the form, reduce required fields |
| Email capture rate < 10% | 2 weeks | Experiment with value delivery timing and copy |
| Average savings < $50/mo | 3 weeks | Re-evaluate audit logic, target different ICP |
| Zero Credex deals in 30 days | 4 weeks | Question product-market fit; consider pivot to paid reports |
| Bounce rate > 70% | 1 week | Rework landing page, test different hooks |

## Measurement Plan

### Tools
- **Vercel Analytics** — page views, unique visitors, bounce rate (free, privacy-friendly)
- **Supabase** — audit count, lead count, savings distribution (we own the data)
- **Posthog** or **Plausible** — event tracking if we need funnels (future)

### Dashboard Queries (Supabase SQL)

```sql
-- Weekly audit count
SELECT DATE_TRUNC('week', created_at) AS week, COUNT(*) AS audits
FROM audits GROUP BY week ORDER BY week DESC LIMIT 12;

-- Average savings per audit
SELECT AVG((results->>'totalMonthlySavings')::numeric) AS avg_savings
FROM audits WHERE created_at > NOW() - INTERVAL '7 days';

-- Lead capture rate
SELECT
  (SELECT COUNT(*) FROM leads WHERE created_at > NOW() - INTERVAL '7 days')::float /
  NULLIF((SELECT COUNT(*) FROM audits WHERE created_at > NOW() - INTERVAL '7 days'), 0)
  AS capture_rate;

-- High-value leads (>$500/mo savings)
SELECT l.email, (a.results->>'totalMonthlySavings')::numeric AS savings
FROM leads l JOIN audits a ON a.lead_id = l.id
WHERE (a.results->>'totalMonthlySavings')::numeric > 500
ORDER BY savings DESC;
```

## What We're NOT Measuring (and Why)

| Metric | Why Not |
|--------|---------|
| Time on page | Doesn't correlate with lead quality for a free tool |
| DAU/MAU | This isn't a SaaS product users return to daily |
| NPS score | Too early; need volume first |
| Revenue per user | Revenue is indirect through Credex, not direct |
