# Reflection — PromptBudget

> **Instructions**: Each answer should be 150–400 words. Be specific and cite examples from your work.

## 1. What was the hardest technical decision you made, and why?

[Write 150-400 words here. Consider discussing one of these:]
- Why you chose to run the audit engine server-side vs client-side
- Why you hardcoded audit logic instead of using AI to generate recommendations
- How you handled the Anthropic API fallback strategy
- Why you chose Supabase over alternatives (Firebase, Planetscale, etc.)

**Starter prompt**: The hardest technical decision was choosing to run the audit engine entirely server-side through API routes rather than client-side...

---

## 2. If you had two more weeks, what would you build next?

[Write 150-400 words here. Consider discussing:]
- PDF export of audit reports (bonus feature from spec)
- Embeddable widget version for partner sites
- Historical audit tracking (show spend trends over time)
- Slack/Teams bot integration for team notifications
- Multi-currency support for international teams
- More sophisticated usage-based analysis (not just plan tier)

---

## 3. What's the biggest risk to this product's success?

[Write 150-400 words here. Consider discussing:]
- The risk that AI tool pricing changes faster than you can update the database
- The risk that the ICP (engineering managers) don't care enough about AI costs to use a free tool
- The risk of lead quality — high audit volume but low Credex conversion
- Competition from vendor-provided dashboards and spending trackers

---

## 4. How did you validate that the audit logic is correct?

[Write 150-400 words here. Consider discussing:]
- The 30 automated tests covering 8 test groups
- Manual verification against real team scenarios
- How every pricing number traces to an official vendor URL
- How the recommendations are "defensible" (a finance person can check)
- Edge cases you tested (solo dev on enterprise plan, API platforms, etc.)

---

## 5. What did you learn about the AI tools market while building this?

[Write 150-400 words here. Consider discussing:]
- The shift from flat pricing to credit/usage-based models (Cursor, Copilot)
- The explosion of tiers (ChatGPT now has 6 plans, Claude has 7)
- How similar the pricing is across competitors ($20/mo is the magic number)
- The gap between individual and team pricing
- How enterprise pricing is opaque and ripe for disruption (Credex's opportunity)

---

> **Tip**: Be honest. If something went wrong, say so. If you made a mistake, explain what you learned. The evaluators are looking for self-awareness, not perfection.
