// const setCY = `{<[use_in_overall_score]={1}, [SchoolReportKey]={'${schoolReportKey}'}, [School Year]={'$(v_cy)'}>}`
// const setPY = `{<[use_in_any_score]={1}, [SchoolReportKey]={'${schoolReportKey}'}, [School Year]={'$(v_py)'}>}`
const setPY = `{<[metric_code]={'PSSA_ELA_PROF','PSSA_ELA_PROF_GRADE3','PSSA_MATH_PROF'}, [use_in_any_score]={1}, [School Year]={'$(v_py)'}>}`

const qDimensions = [
  {
    qDef: {
      qFieldDefs: ['metric_code'],
      qFieldLabels: ['metricCode'],
    },
    qNullSuppression: true,
  },
  {
    qDef: {
      qFieldDefs: ['metric_code_group'],
      qFieldLabels: ['metricCodeGroup'],
    },
  },
  {
    qDef: {
      qFieldDefs: ['subgroup_agg'],
      qFieldLabels: ['studentGroupCode'],
    },
  },
  {
    qDef: {
      qFieldDefs: ['Student Group (w/ All)'],
      qFieldLabels: ['studentGroup'],
    },
  },
  {
    qDef: {
      qFieldDefs: ['flag_ethnicity'],
      qFieldLabels: ['isEthnicity'],
    },
  },
  {
    qDef: {
      qFieldDefs: ['metric_label'],
      qFieldLabels: ['metricLabel'],
    },
  },
]
const qMeasures = [
  {
    qDef: {
      qDef: `Avg(${setPY} score)`,
      qLabel: 'score',
    },
  },
  {
    qDef: {
      qDef: `Sum(${setPY} numer)`,
      qLabel: 'numerator',
    },
  },
  {
    qDef: {
      qDef: `Sum(${setPY} denom)`,
      qLabel: 'denominator',
    },
  },
  {
    qDef: {
      qDef: `Avg(${setPY} target_at)`,
      qLabel: 'targetAt',
    },
  },
  {
    qDef: {
      qDef: `Avg(${setPY} target_approaching)`,
      qLabel: 'targetApproaching',
    },
  },
  {
    qDef: {
      qDef: `Avg(${setPY} target_above)`,
      qLabel: 'targetAbove',
    },
  },
]
export default {
  qInfo: { qType: 'visualization' },
  qHyperCubeDef: {
    qDimensions,
    qMeasures,
    qInitialDataFetch: [{ qWidth: 20, qHeight: 500 }],
    qSuppressZero: true,
  },
}
