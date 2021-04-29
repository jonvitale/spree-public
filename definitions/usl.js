export default {
  qInfo: { qType: 'visualization' },
  qHyperCubeDef: {
    qDimensions: [
      {
        qDef: {
          qFieldDefs: ['SchoolReportKey'],
          qFieldLabels: ['schoolReportKey'],
          qSortCriterias: [{ qSortByLoadOrder: 0, qSortByAscii: 1 }],
        },
        qNullSuppression: true,
      },
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
          qFieldDefs: ['slug_report'],
          qFieldLabels: ['slugReport'],
        },
        qNullSuppression: false,
      },
      {
        qDef: {
          qFieldDefs: ['ULCS Code'],
          qFieldLabels: ['ulcs'],
        },
        qNullSuppression: true,
      },
      {
        qDef: {
          qFieldDefs: ['Current Network'],
          qFieldLabels: ['network'],
        },
        qNullSuppression: true,
      },
      {
        qDef: {
          qFieldDefs: ['Sector'],
          qFieldLabels: ['sector'],
        },
        qNullSuppression: false,
      },
      {
        qDef: {
          qFieldDefs: ['Grades Served'],
          qFieldLabels: ['gradesServed'],
        },
        qNullSuppression: false,
      },
      // {
      //   qDef: {
      //     qFieldDefs: ['PersonName_SchoolLeader'],
      //     qFieldLabels: ['schoolLeader'],
      //   },
      //   qNullSuppression: false,
      // },
      // {
      //   qDef: {
      //     qFieldDefs: ['street_address'],
      //     qFieldLabels: ['address'],
      //   },
      //   qNullSuppression: false,
      // },
      // {
      //   qDef: {
      //     qFieldDefs: ['phonenumber'],
      //     qFieldLabels: ['phonenumber'],
      //   },
      //   qNullSuppression: false,
      // },
      // {
      //   qDef: {
      //     qFieldDefs: ['website'],
      //     qFieldLabels: ['website'],
      //   },
      //   qNullSuppression: false,
      // },
      {
        qDef: {
          qFieldDefs: ['report'],
          qFieldLabels: ['report'],
        },
        qNullSuppression: false,
      },
      {
        qDef: {
          qFieldDefs: ['Admission Type'],
          qFieldLabels: ['admissiontype'],
        },
        qNullSuppression: true,
      },
      // {
      //   qDef: {
      //     qFieldDefs: ['turnaround'],
      //     qFieldLabels: ['turnaround'],
      //   },
      //   qNullSuppression: true,
      // },
    ],
    qMeasures: [
      {
        qDef: {
          qDef: `Count(distinct {<[School Year]={'$(v_cy)'}>} 1)`,
          qLabel: 'flagCY',
        },
      },
    ],
    qInitialDataFetch: [{ qWidth: 20, qHeight: 500 }],
  },
}
