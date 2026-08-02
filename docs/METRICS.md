# Success Metrics Baseline — Aurashape

*August 2026 | Version 1.0*

## North Star Metric

**Weekly Active Users who log 5+ days per week**

Rationale: The core value of Aurashape is consistent health tracking. A user who logs food/exercise/fasting 5+ days/week is getting real value.

---

## Funnel Targets (6-month projections)

### Acquisition
| Metric | Month 1 | Month 3 | Month 6 |
|---|---|---|---|
| App Store impressions | 500 | 2,000 | 5,000 |
| App Store page views | 200 | 800 | 2,000 |
| Downloads | 50 | 250 | 700 |
| Conversion rate (impression→download) | 10% | 12.5% | 14% |

### Activation
| Metric | Target |
|---|---|
| Sign-up completion rate | 60% (of downloads) |
| Onboarding completion rate | 50% (of sign-ups) |
| First meal logged | 40% (of onboarded users) |
| Time to first meal log | < 1 day |

### Engagement
| Metric | Month 1 | Month 3 | Month 6 |
|---|---|---|---|
| DAU (Daily Active Users) | 10 | 50 | 150 |
| WAU (Weekly Active Users) | 20 | 100 | 300 |
| DAU/MAU ratio | 30% | 35% | 40% |
| Avg sessions per day | 2.5 | 3.0 | 3.5 |
| Avg session duration | 4 min | 5 min | 6 min |

### Feature Adoption (by Month 3)
| Feature | Target adoption |
|---|---|
| Food diary (weekly active) | 70% of WAU |
| Fasting tracker (weekly active) | 40% of WAU |
| Workout logger (weekly active) | 30% of WAU |
| Body measurements | 20% of users (ever) |
| Progress photos | 15% of users (ever) |

### Retention
| Metric | Month 1 | Month 3 | Month 6 |
|---|---|---|---|
| Day 1 retention | 40% | 45% | 50% |
| Day 7 retention | 25% | 30% | 35% |
| Day 30 retention | 15% | 20% | 25% |

### Community (by Month 4)
| Metric | Target |
|---|---|
| Forum posts per week | 50 |
| Recipes submitted | 30 |
| Challenge participants | 100 |
| Newsletter subscribers | 500 |

### Email
| Metric | Target |
|---|---|
| Newsletter open rate | 30% |
| Newsletter click rate | 8% |
| Welcome email open rate | 60% |

---

## Health Metrics (GDPR-compliant — aggregate only, no PII)

| Metric | Target |
|---|---|
| Avg % of calorie target hit | 80-100% |
| Avg fasting compliance rate | 70% |
| Avg workouts per week | 2.5 |
| Avg weight change direction | improving toward goal |

---

## Dashboard Setup (PostHog)

Person A should create the following dashboards:

1. **Acquisition Dashboard**: Downloads, store impressions, page views, conversion rate
2. **Activation Dashboard**: Sign-up → onboarding → first meal funnel
3. **Engagement Dashboard**: DAU, WAU, feature adoption by feature
4. **Retention Dashboard**: D1/D7/D30 cohorts
5. **Community Dashboard**: Posts, recipes, challenges (Month 4+)

All dashboards should filter by: no PII, EU-only, anonymous events.
