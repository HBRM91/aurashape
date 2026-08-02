export interface ReadingSource {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  summary: string;
  url?: string;
}

export const READING_SOURCES: ReadingSource[] = [
  {
    id: 'rs1',
    title: 'Effects of Intermittent Fasting on Health, Aging, and Disease',
    authors: 'de Cabo R, Mattson MP',
    journal: 'New England Journal of Medicine',
    year: 2019,
    summary: 'Comprehensive review showing intermittent fasting improves insulin sensitivity, reduces oxidative stress, and extends lifespan in model organisms. Human trials show 3-8% weight loss and improved cardiovascular markers.',
  },
  {
    id: 'rs2',
    title: 'Dietary Protein and Muscle Mass: Translating Science to Application',
    authors: 'Phillips SM, Van Loon LJ',
    journal: 'Journal of Sports Sciences',
    year: 2011,
    summary: 'Establishes protein targets of 1.2-1.6 g/kg for maintenance and 1.6-2.2 g/kg for muscle gain. Highlights the importance of leucine content and per-meal dosing of 0.25-0.40 g/kg.',
  },
  {
    id: 'rs3',
    title: 'Alternate Day Fasting Improves Physiological and Molecular Markers of Aging',
    authors: 'Stekovic S et al.',
    journal: 'Cell Metabolism',
    year: 2019,
    summary: 'Four-week trial of alternate-day fasting in healthy non-obese adults showed reduced cardiovascular risk markers, lower circulating IGF-1, and improved fat-to-lean ratio without adverse effects on immune function.',
  },
  {
    id: 'rs4',
    title: 'Sleep Curtailment in Healthy Young Men Is Associated with Decreased Leptin and Elevated Ghrelin',
    authors: 'Spiegel K et al.',
    journal: 'Annals of Internal Medicine',
    year: 2004,
    summary: 'Two nights of 4-hour sleep increased ghrelin by 28% and decreased leptin by 18%. Hunger ratings rose 24%, with appetite for calorie-dense foods increasing 33-45%.',
  },
  {
    id: 'rs5',
    title: 'Long-Term Persistence of Hormonal Adaptations to Weight Loss',
    authors: 'Sumithran P et al.',
    journal: 'New England Journal of Medicine',
    year: 2011,
    summary: 'One year after 10% weight loss, ghrelin remained elevated by 20%, satiety hormones (PYY, CCK) remained suppressed, and subjective hunger was higher than baseline, suggesting a biological drive toward regain.',
  },
  {
    id: 'rs6',
    title: 'Resistance Training Frequency and Muscle Hypertrophy: A Meta-Analysis',
    authors: 'Schoenfeld BJ et al.',
    journal: 'Sports Medicine',
    year: 2016,
    summary: 'Meta-analysis of 10 studies found training muscles twice per week produced significantly greater hypertrophy than once per week at equal total volume, with effects most pronounced in the upper body.',
  },
  {
    id: 'rs7',
    title: 'Dose-Response Relationship Between Weekly Resistance Training Volume and Muscle Mass',
    authors: 'Schoenfeld BJ et al.',
    journal: 'Journal of Sports Sciences',
    year: 2017,
    summary: 'Under 5 weekly sets produced minimal growth, 5-9 sets modest gains, and 10+ sets robust hypertrophy. Beyond 20 sets per muscle per week, additional volume provided diminishing returns.',
  },
  {
    id: 'rs8',
    title: 'Protein Leverage Hypothesis: The Role of Dietary Protein in Human Food Intake Regulation',
    authors: 'Simpson SJ, Raubenheimer D',
    journal: 'Obesity Reviews',
    year: 2005,
    summary: 'Animals including humans eat until protein needs are met, not calorie needs. When protein is diluted by carbohydrates and fat, total calorie intake rises to compensate, explaining the satiating effect of high-protein diets.',
  },
  {
    id: 'rs9',
    title: 'Circadian Physiology of Metabolism',
    authors: 'Panda S',
    journal: 'Science',
    year: 2016,
    summary: 'The circadian clock in the liver, muscle, and fat tissue directly regulates glucose and lipid metabolism. Eating at the wrong circadian time disrupts metabolic regulation, leading to elevated blood glucose despite identical meals.',
  },
  {
    id: 'rs10',
    title: 'Pre-Sleep Protein Ingestion Increases Muscle Mass and Strength Gains',
    authors: 'Snijders T et al.',
    journal: 'Journal of Nutrition',
    year: 2015,
    summary: 'Consuming 40g of casein protein before sleep increased overnight muscle protein synthesis by 22%. Over 12 weeks of resistance training, the pre-sleep protein group gained significantly more muscle mass and strength.',
  },
];

export function findSource(query: string): ReadingSource[] {
  if (!query || query.trim().length === 0) return READING_SOURCES;
  const q = query.toLowerCase();
  return READING_SOURCES.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.authors.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q)
  );
}
