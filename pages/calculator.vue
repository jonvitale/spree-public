<template>
  <div>
    <Columns>
      <Column side="left" width="1/3">
        <Square id="main-filter-panel" color="tint" class="sticky top-0">
          <QlikFilter
            id="main-school-filter"
            style="max-height: 400px"
            title="School Name and Report Type"
            field="School Name (Reporting Category)"
            @change="handleFieldSelections"
          />
        </Square>
      </Column>
      <Column id="main-content-side" side="right" width="2/3">
        <div class="text-xl text-center py-2">
          {{ $store.state.selections.schoolReport }}
        </div>
        <div
          v-for="(metric, mIndex) in userMetrics"
          :key="metric.id"
          class="ml-4 mb-4 flex flex-col items-start"
        >
          <div v-if="!metric.isSuppressed">
            <div class="text-lg font-bold">
              {{ metric.label }}
            </div>
            <div class="flex items-center p-2">
              <spree-projection-slider
                :metric="metric"
                class="b-slider"
                @input="updateMetricNumerator"
              />
              <div class="mx-4 text-xl w-12">{{ pct(metric.score) }}</div>
              <div
                class="mx-4 text-xl text-white w-48 text-center"
                :style="{ 'background-color': getMetricTierColor(metric) }"
              >
                {{ getMetricTier(metric, true) }}
              </div>
              <button
                v-if="metric.changed"
                class="text-red-600 font-semibold text-lg"
                @click="copyMetrics"
              >
                Reset
              </button>
            </div>
            <div class="bg-gray-200 p-2">
              <div class="flex justify-center">
                <content-button
                  @click="
                    handleSubgroupTypeSelection(
                      mIndex,
                      showSubgroupTypes[mIndex] ? '' : 'ETHNICITY'
                    )
                  "
                >
                  <div v-if="showSubgroupTypes[mIndex]">Hide Subgroups</div>
                  <div v-else>Show by Subgroup</div>
                </content-button>
                <button-group
                  v-if="showSubgroupTypes[mIndex]"
                  :options="subgroupDict"
                  :selected-value="showSubgroupTypes[mIndex]"
                  @click="handleSubgroupTypeSelection(mIndex, $event.value)"
                />
              </div>
              <div v-if="showSubgroupTypes[mIndex]">
                <div
                  v-if="
                    metric[showSubgroupTypes[mIndex]].filter(
                      ({ isSuppressed }) => !isSuppressed
                    ).length > 0
                  "
                >
                  <div
                    v-for="subgroup in metric[showSubgroupTypes[mIndex]]"
                    :key="subgroup.id"
                  >
                    <div v-if="!subgroup.isSuppressed">
                      <div class="text-lg ml-4">{{ subgroup.label }}</div>
                      <div class="flex items-center">
                        <spree-projection-slider
                          :metric="subgroup"
                          :overall-metric="metric"
                          class="b-slider"
                          @input="updateMetricNumerator"
                        />
                        <div class="mx-4 text-xl w-12">
                          {{ pct(subgroup.score) }}
                        </div>
                        <div
                          class="mx-4 text-xl text-white w-48 text-center"
                          :style="{
                            'background-color': getMetricTierColor(subgroup),
                          }"
                        >
                          {{ getMetricTier(subgroup, true) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div class="text-lg text-center">
                    This group does not have enough participants for display
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Column>
    </Columns>
  </div>
</template>
<script>
import SelectionsMixin from '~/mixins/SelectionsMixin'
import calculatorMetricsDef from '~/definitions/calculator-metrics'
import SpreeProjectionSlider from '~/components/SpreeProjectionSlider'
import Columns from '~sdp-components/PageElements/Columns'
import Column from '~sdp-components/PageElements/Column'
import Square from '~sdp-components/PageElements/Square'
import QlikFilter from '~sdp-components/Qlik/QlikFilter'
import ButtonGroup from '~sdp-components/PageElements/ButtonGroup'
import ContentButton from '~sdp-components/PageElements/ContentButton'

const subgroupDict = {
  ETHNICITY: 'Ethnicity',
  ECDIS: 'Economically Disadvantaged',
  EL: 'English Learner',
  SPED: 'Special Education',
}
const subgroupTypes = Object.keys(subgroupDict).map((key) => key)

const metricNesting = {
  PSSA_ELA_PROF: ['PSSA_ELA_PROF_GRADE3'],
}

export default {
  name: 'CalculatorPage',
  components: {
    SpreeProjectionSlider,
    Columns,
    Column,
    Square,
    QlikFilter,
    ButtonGroup,
    ContentButton,
  },
  mixins: [SelectionsMixin],
  data() {
    return {
      metricValues: null,
      metricSessionObject: null,
      userMetrics: null,
      showSubgroupTypes: [], // one per metric
    }
  },
  computed: {
    subgroupDict() {
      return subgroupDict
    },
    metrics() {
      // first just get the top level, where student group is 'All'
      let metrics =
        this.metricValues?.studentGroup
          ?.map(({ text }, index) => ({
            id: this.metricValues?.metricCode[index]?.text || '',
            label: this.metricValues?.metricLabel[index]?.text || '',
            denominator:
              parseFloat(this.metricValues?.denominator[index]?.text) || NaN,
            numerator:
              parseFloat(this.metricValues?.numerator[index]?.text) || NaN,
            score: parseFloat(this.metricValues?.score[index]?.text) || NaN,
            targetAt:
              parseFloat(this.metricValues?.targetAt[index]?.text) || NaN,
            targetApproaching:
              parseFloat(this.metricValues?.targetApproaching[index]?.text) ||
              NaN,
            targetAbove:
              parseFloat(this.metricValues?.targetAbove[index]?.text) || NaN,
            isSuppressed: !isFinite(
              parseFloat(this.metricValues?.score[index]?.text)
            ),
            isSubgroup: text !== 'All',
          }))
          .filter(({ isSubgroup }) => !isSubgroup) || []
      // add the subgroups to each metric
      subgroupTypes.forEach((type) => {
        metrics = metrics.map((metric) => {
          const m = { ...metric }
          m[type] = []
          return m
        })
      })

      const ids = metrics.map(({ id }) => id)

      // second, nest student groups within their "parent" metric
      this.metricValues?.studentGroup.forEach(({ text }, index) => {
        const id = this.metricValues?.metricCode[index]?.text || ''
        // lookup the location of this id in the parent array
        const pIndex = ids.indexOf(id)
        if (pIndex >= 0) {
          const subgroup = {
            id: this.metricValues?.metricCodeGroup[index]?.text || '',
            label: this.metricValues?.studentGroup[index]?.text || '',
            denominator:
              parseFloat(this.metricValues?.denominator[index]?.text) || NaN,
            numerator:
              parseFloat(this.metricValues?.numerator[index]?.text) || NaN,
            score: parseFloat(this.metricValues?.score[index]?.text) || NaN,
            targetAt:
              parseFloat(this.metricValues?.targetAt[index]?.text) || NaN,
            targetApproaching:
              parseFloat(this.metricValues?.targetApproaching[index]?.text) ||
              NaN,
            targetAbove:
              parseFloat(this.metricValues?.targetAbove[index]?.text) || NaN,
            isSuppressed: !isFinite(
              parseFloat(this.metricValues?.score[index]?.text)
            ),
          }
          const isEthnicity =
            this.metricValues?.isEthnicity[index]?.number || false
          if (isEthnicity) {
            metrics[pIndex].ETHNICITY.push(subgroup)
          } else if (text !== 'All') {
            // is this one of the other subgroups
            const subgroupName =
              this.metricValues?.studentGroupCode[index]?.text || ''
            const sgIndex = subgroupTypes.indexOf(subgroupName)
            if (sgIndex >= 0) {
              metrics[pIndex][subgroupTypes[sgIndex]].push(subgroup)
            }
          }
        }
      })

      // third, create an other group for each subgroup type, if this metric has subgroups
      metrics.forEach((metric) => {
        subgroupTypes.forEach((subgroupType) => {
          const numeratorAcc = metric[subgroupType].reduce(
            (acc, cur) => acc + (!cur.isSuppressed ? cur.numerator : 0),
            0
          )
          const denominatorAcc = metric[subgroupType].reduce(
            (acc, cur) => acc + (!cur.isSuppressed ? cur.denominator : 0),
            0
          )
          if (denominatorAcc > 0) {
            const subgroup = {
              id: 'Other',
              label: 'All Other Students',
              denominator: metric.denominator - denominatorAcc,
              numerator: metric.numerator - numeratorAcc,
              score:
                (metric.numerator - numeratorAcc) /
                (metric.denominator - denominatorAcc),
              targetAt: metric.targetAt,
              targetApproaching: metric.targetApproaching,
              targetAbove: metric.targetAbove,
              isSuppressed: false,
            }
            metric[subgroupType].push(subgroup)
          }
        })
      })
      return metrics
    },
  },
  watch: {
    metrics() {
      this.copyMetrics()
      this.showSubgroupTypes = this.metrics.map(() => '')
    },
  },
  async created() {
    // await this.$qlik.selectFieldValues('SchoolReportKey', [
    //     { text: this.schoolReportKey },
    //   ])

    this.metricSessionObject = await this.$qlik.generateHypercubeObjectFromDef(
      calculatorMetricsDef
    )

    this.metricSessionObject.addListener('changed', this.update)
    this.update()
  },
  methods: {
    copyMetrics() {
      this.userMetrics = JSON.parse(JSON.stringify(this.metrics))
      // create old values for numerators and score
      this.userMetrics.forEach((metric) => {
        metric.originalNumerator = metric.numerator
        metric.originalScore = metric.score
        metric.changed = false
        subgroupTypes.forEach((type) => {
          metric[type].forEach((subgroup) => {
            subgroup.originalNumerator = subgroup.numerator
            subgroup.originalScore = subgroup.score
            subgroup.changed = false
          })
        })
      })
    },
    async update() {
      if (this.metricSessionObject) {
        this.metricValues = await this.$qlik.getValuesFromHypercubeObject(
          this.metricSessionObject
        )
      }
    },
    getMetricTier(metric, asLabel) {
      return metric.score < metric.targetApproaching
        ? asLabel
          ? 'Below Target'
          : 'below'
        : metric.score < metric.targetAt
        ? asLabel
          ? 'Approaching Target'
          : 'approaching'
        : metric.score < metric.targetAbove
        ? asLabel
          ? 'At Target'
          : 'at'
        : metric.score >= metric.targetAbove
        ? asLabel
          ? 'Above Target'
          : 'above'
        : asLabel
        ? 'N/A'
        : 'none'
    },
    getMetricTierColor(metric) {
      const rgbDefault = {
        below: {
          r: 192,
          g: 80,
          b: 77,
        },
        approaching: {
          r: 247,
          g: 150,
          b: 70,
        },
        at: {
          r: 0,
          g: 176,
          b: 80,
        },
        above: {
          r: 0,
          g: 112,
          b: 192,
        },
        none: {
          r: 200,
          g: 200,
          b: 200,
        },
      }
      const tier = this.getMetricTier(metric)
      const { r, g, b } = rgbDefault[tier]
      return `rgba(${r},${g},${b},1)`
    },
    /**
     * updateMetricNumerator is for changes to metrics by the user.
     * If the metric being adjusted is an overall metric (not a particular subgroup),
     *   the changes are distributed to each subgroup.
     * If the metric being adjusted is a particular subgroup, the changes
     *   are bubbled up to the overall level (given by the overallMetric argement)
     * If the metric being adjusted has a nested sub-metric (e.g. ELA Prof and ELA Prof Grade 3)
     *   the change is sent to the sub-metric
     * If the metric being adjusted is nested within a parent metric
     *   the change is bubbled up to the parent metric
     */
    updateMetricNumerator(
      newNumerator,
      metric,
      overallMetric,
      ignoreSubgroups,
      ignoreNesting
    ) {
      const numerator = metric.numerator
      const dNumerator = newNumerator - numerator
      // how many are not in the numerator?
      const invNumerator = metric.denominator - metric.numerator
      metric.numerator = newNumerator
      metric.score = metric.numerator / metric.denominator
      metric.changed = true
      // if this is an overall metric, adjust submetrics
      if (!ignoreSubgroups && metric?.ETHNICITY) {
        // distribute numerator change proportionally to each subgroup
        // if adding to numerator, what percent of not-in-numerator is this group
        // if taking away from numerator, what percent of numerator is this group
        // keep track of how many have been distributed
        subgroupTypes.forEach((subgroupType) => {
          let dNumeratorAcc = 0
          metric[subgroupType].forEach((subgroup) => {
            if (!subgroup.isSuppressed && subgroup.id !== 'Other') {
              const remainder = dNumerator - dNumeratorAcc
              // what percent of total group's remainder or numerator is this child metric
              const proportion =
                dNumerator > 0
                  ? (subgroup.denominator - subgroup.numerator) / invNumerator
                  : subgroup.numerator / numerator
              // when sliding the numbers may be too small to actually change the value
              // so randomly give a 1 or -1 based on proportion
              const dSubgroupNumerator =
                dNumerator > 0
                  ? Math.min(
                      remainder,
                      Math.max(
                        Math.random() < proportion ? 1 : 0,
                        Math.round(proportion * dNumerator)
                      )
                    )
                  : Math.max(
                      remainder,
                      Math.min(
                        Math.random() < proportion ? -1 : 0,
                        Math.round(proportion * dNumerator)
                      )
                    )
              dNumeratorAcc += dSubgroupNumerator
              // if (!dNumeratorAcc)
              //   console.log('bust', d, dNumerator, remainder, invNumerator)
              subgroup.numerator =
                parseFloat(subgroup.numerator) + dSubgroupNumerator
              subgroup.score = subgroup.numerator / subgroup.denominator
              subgroup.changed = true
            }
          })
          // give the rest to other
          metric[subgroupType]
            .filter(({ id }) => id === 'Other')
            .forEach((subgroup) => {
              // const n = subgroup.numerator
              subgroup.numerator =
                parseFloat(subgroup.numerator) + dNumerator - dNumeratorAcc
              subgroup.score = subgroup.numerator / subgroup.denominator
              subgroup.changed = true
              // console.log('d', n, dNumerator, dNumeratorAcc, subgroup.numerator)
            })
        })
      } else if (overallMetric) {
        // call this, but with the ignoreSubgroup flag as true so that we don't get stuck in a loop
        this.updateMetricNumerator(
          parseFloat(overallMetric.numerator) + dNumerator,
          overallMetric,
          null,
          true
        )
      }

      if (!ignoreNesting) {
        // check if there are nested sub-metrics for this metric, if so distribute the change to this submetric
        if (Object.keys(metricNesting).includes(metric.id)) {
          metricNesting[metric.id].forEach((childMetricId) => {
            const childMetric = this.userMetrics
              .filter(({ id }) => id === childMetricId)
              .pop()
            // what percent of total group's remainder or numerator is this child metric
            const proportion =
              dNumerator > 0
                ? (childMetric.denominator - childMetric.numerator) /
                  invNumerator
                : childMetric.numerator / numerator
            // when sliding the numbers may be too small to actually change the value
            // so randomly give a 1 or -1 based on proportion
            const dChildNumerator =
              dNumerator > 0
                ? Math.max(
                    Math.random() < proportion ? 1 : 0,
                    Math.round(proportion * dNumerator)
                  )
                : Math.min(
                    Math.random() < proportion ? -1 : 0,
                    Math.round(proportion * dNumerator)
                  )
            this.updateMetricNumerator(
              childMetric.numerator + dChildNumerator,
              childMetric
            )
          })
        }
        // check if this metric is a sub-metric of another metric, if so bubble the chanes to the parent
        // if this is a subgroup change make sure to change that value first
        let parentMetric = null
        Object.keys(metricNesting).forEach((parentMetricId) => {
          if (metricNesting[parentMetricId].includes(metric.id)) {
            parentMetric = this.userMetrics
              .filter(({ id }) => id === parentMetricId)
              .pop()
          }
        })
        if (parentMetric) {
          const x = parentMetric.numerator + dNumerator
          this.updateMetricNumerator(x, parentMetric, null, false, true)
        }
      }
    },

    handleSubgroupTypeSelection(metricIndex, value) {
      this.showSubgroupTypes = this.showSubgroupTypes.map((val, i) =>
        metricIndex === i ? value : val
      )
    },
    pct(number, decimalPlaces) {
      decimalPlaces = decimalPlaces ?? 1
      return `${
        Math.round(number * 100 * Math.pow(10, decimalPlaces)) /
        Math.pow(10, decimalPlaces)
      }%`
    },
    num(number, decimalPlaces) {
      decimalPlaces = decimalPlaces ?? 0
      const n =
        Math.round(number * Math.pow(10, decimalPlaces)) /
        Math.pow(10, decimalPlaces)
      return n.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
    },
  },
}
</script>
<style lang="postcss" scoped>
.b-slider {
  width: 400px;
}
</style>
