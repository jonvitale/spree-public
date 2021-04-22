export default function (schoolReportKey) {
  // const setCY = `{<[use_in_overall_score]={1}, [SchoolReportKey]={'${schoolReportKey}'}, [School Year]={'$(v_cy)'}>}`
  const setPY = `{<[use_in_overall_score]={1}, [SchoolReportKey]={'${schoolReportKey}'}, [School Year]={'$(v_py)'}>}`

  const qDimensions = [
    {
      qDef: {
        qFieldDefs: ['School Name (Reporting Category)'],
        qFieldLabels: ['schoolReport'],
        qSortCriterias: [{ qSortByLoadOrder: 0, qSortByAscii: 1 }],
      },
      qNullSuppression: true,
    },
    {
      qDef: {
        qFieldDefs: ['metric_code'],
        qFieldLabels: ['metricCode'],
      },
      qNullSuppression: true,
    },
    {
      qDef: {
        qFieldDefs: ['metric_label'],
        qFieldLabels: ['metricLabel'],
      },
    },
    {
      qDef: {
        qFieldDefs: ['numer'],
        qFieldLabels: ['numerator'],
      },
    },
    {
      qDef: {
        qFieldDefs: ['denom'],
        qFieldLabels: ['denominator'],
      },
    },
    {
      qDef: {
        qFieldDefs: ['score'],
        qFieldLabels: ['score'],
      },
    },
  ]
  const qMeasures = [
    {
      qDef: {
        qDef: `Count(distinct ${setPY} 1)`,
        qLabel: 'flagPY',
      },
    },
  ]
  return {
    qInfo: { qType: 'visualization' },
    qHyperCubeDef: {
      qDimensions,
      qMeasures,
      qInitialDataFetch: [{ qWidth: 20, qHeight: 500 }],
      qSuppressZero: true,
    },
  }
}
