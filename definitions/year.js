export default {
  qInfo: { qType: 'visualization' },
  qHyperCubeDef: {
    qDimensions: [
      {
        qDef: {
          qFieldDefs: ['year_academic'],
          qFieldLabels: ['SchoolYear'],
        },
        qNullSuppression: true,
      },
    ],
    qInitialDataFetch: [{ qWidth: 2, qHeight: 100 }],
  },
}
