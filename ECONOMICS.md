# Unit Economics — PromptBudget

## Business Model

PromptBudget is a **free lead-generation tool** for Credex. It generates revenue indirectly by funneling qualified leads to Credex's core business (discounted AI infrastructure credits).

## Cost Structure

### Fixed Costs (Monthly)

| Item | Cost | Notes |
|------|------|-------|
| Vercel hosting (Pro) | $20 | Covers deployment, serverless functions, bandwidth |
| Supabase (Free tier) | $0 | 500MB DB, 50K requests, 1GB storage |
| Resend (Free tier) | $0 | 100 emails/day = 3,000/mo |
| Domain | $1 | Amortized from ~$12/year |
| **Total fixed** | **$21/mo** | |

### Variable Costs (Per Audit)

| Item | Cost | Notes |
|------|------|-------|
| Anthropic API (summary) | ~$0.005 | ~300 tokens output @ Sonnet pricing |
| Supabase storage | ~$0.0001 | ~2KB per audit record |
| Vercel function execution | ~$0.0001 | ~200ms per invocation |
| **Total per audit** | **~$0.005** | |

### Scaling Thresholds

| Milestone | Monthly Cost | Notes |
|-----------|-------------|-------|
| 100 audits/mo | $21.50 | Well within free tiers |
| 1,000 audits/mo | $26 | Still mostly free tiers |
| 10,000 audits/mo | $75 | May need Supabase Pro ($25) + more API calls |
| 50,000 audits/mo | $300 | Vercel + Supabase + Anthropic at scale |

## Revenue Model (via Credex)

### Lead Value Calculation

```
Average qualifying audit savings:     $800/mo
Credex take rate on savings:          15%
Monthly revenue per Credex customer:  $120/mo
Average contract length:              12 months
Customer Lifetime Value (LTV):        $1,440
```

### Conversion Funnel Economics

```
1,000 landing page visitors
→ 400 start audit (40%)
→ 300 complete audit (75%)
→ 75 enter email (25%)
→ 25 qualify (savings > $500/mo, 33%)
→ 5 book call (20%)
→ 2 close (40%)

Revenue: 2 × $1,440 LTV = $2,880
Cost: $21 fixed + $1.50 variable = $22.50
CAC: $22.50 ÷ 2 = $11.25 per customer
LTV:CAC = 128:1
```

### Unit Economics Summary

| Metric | Value |
|--------|-------|
| Customer Acquisition Cost (CAC) | ~$11 |
| Lifetime Value (LTV) | ~$1,440 |
| LTV:CAC Ratio | 128:1 |
| Payback Period | < 1 month |
| Gross Margin | ~99% (software) |

## Why These Numbers Are Defensible

1. **CAC is near-zero** because PromptBudget is a free tool — the "marketing spend" is just hosting ($21/mo). Real-world CAC will be higher once you factor in content creation time, but the infrastructure cost is negligible.

2. **LTV assumes 12-month retention** which is conservative for B2B SaaS infrastructure. AI tool spend is recurring and grows with team size.

3. **The conversion funnel is conservative**. 25% email capture on a free tool that's already shown value is below industry benchmarks for gated content (typically 30–50%).

4. **The biggest risk is qualification rate**. If fewer than 33% of email leads spend >$500/mo on AI tools, the funnel tightens. This is why the ICP focuses on Series A+ teams with 10+ devs.

## Break-Even Analysis

| Scenario | Audits Needed | Customers Needed | Monthly Revenue |
|----------|---------------|-------------------|-----------------|
| Cover hosting | 5 | 0.02 | $21 |
| Cover 1 FTE ($5K/mo) | 2,500 | 10 | $5,000 |
| $10K MRR | 5,000 | 7 | $10,000 |

## Key Assumptions & Risks

| Assumption | Risk Level | Mitigation |
|-----------|-----------|------------|
| Credex discount is real (10–20%) | Low | Core business model; already validated |
| Teams will share audit results | Medium | Built sharing into the product (OG tags, Twitter) |
| AI tool spend continues growing | Low | Market trend is clear; every dev uses AI tools now |
| Anthropic API stays affordable | Low | Fallback template; API cost is <$0.01/audit |
| Supabase free tier is sufficient | Low | Easy to upgrade; data is portable |
