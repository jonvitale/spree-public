// import Vue from 'vue';

export const state = () => ({
  initialized: false,
  list: [],
})

export const getters = {
  list: (state) => {
    return state.list
  },
  getFieldBySchoolReportKey: (state) => {
    return (field, schoolReportKey) => {
      const index = state.list.schoolReportKey
        .map((obj, index) => ({
          ...obj,
          index,
        }))
        .filter(({ text }) => text === schoolReportKey)
        .map(({ index }) => index)
      if (index.length >= 0) {
        return state.list[field][index[0]]
      } else {
        throw new Error(`schoolReportKey does not exist, ${schoolReportKey}`)
      }
    }
  },
}

export const mutations = {
  initialized(state, val) {
    state.initialized = val
  },
  add(state, data) {
    state.list.push(data)
  },
  join(state, data) {
    // do something
    if (data.schoolReportKey) {
      // first create an order of indices to match between datasets
      const order = []
      state.list.schoolReportKey.forEach(({ text: key }) => {
        // find this key value in the new data
        const index = data.schoolReportKey.map(({ text }) => text).indexOf(key)
        order.push(index >= 0 ? index : null)
      })
      // loop through all fields on data creating an ordered array
      // to match data
      Object.keys(data).forEach((key) => {
        if (key !== 'schoolReportKey') {
          const orderedArray = order.map((fromIndex) =>
            fromIndex >= 0 ? data[key][fromIndex] : null
          )
          state.list[key] = orderedArray
        }
      })
    } else {
      throw new Error('schoolReportKey must be on joining dataset')
    }
  },
  replace(state, data) {
    state.list = data
  },
  empty(state) {
    state.list = []
  },
}

export const actions = {
  set_schools({ commit }, values) {
    commit('replace', values)
    commit('initialized', true)
  },
  // To join schools(reports) must have schoolReportKey
  join_schools({ commit }, values) {
    commit('join', values)
  },

  lookup_slugreport_by_schoolreport({ state }, schoolReport) {
    // console.log("lookup_slugreport_by_schoolreport ", schoolReport, state.list)
    const slugReport = this.$qlik.lookupValueByFieldValue(
      state.list,
      'schoolReport',
      schoolReport,
      'slugReport'
    )
    if (slugReport) {
      return slugReport.text
    } else {
      return ''
    }
  },

  lookup_text_by_slugreport({ state }, { slugReport, target }) {
    // console.log("lookup_text_by_slugreport",  slugReport, target, state.list)
    const value = this.$qlik.lookupValueByFieldValue(
      state.list,
      'slugReport',
      slugReport,
      target
    )
    if (value) {
      return value.text
    } else {
      return ''
    }
  },
}
