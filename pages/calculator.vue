<template>
  <div>
    <div>
      {{ schoolReportKey }}
    </div>
    <div v-for="metric in metrics" :key="metric.id">
      <div v-if="metric.id === 'PSSA_ELA_PROF'">
        {{ metric.label }}
        <div class="flex w-full justify-between">
          <div>{{ metric.score }}</div>
          <div>{{ metric.numerator }}</div>
          <div>{{ metric.denominator }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import calculatorMetricsDef from '~/definitions/calculator-metrics'

export default {
  name: 'CalculatorPage',
  data() {
    return {
      schoolReportKey: '7400|K8',
      metricValues: null,
      metricSessionObject: null,
    }
  },
  computed: {
    metrics() {
      return (
        this.metricValues?.metricCode?.map(({ text }, index) => ({
          id: text,
          label: this.metricValues?.metricLabel[index]?.text || '',
          denominator: this.metricValues?.denominator[index]?.text || '',
          numerator: this.metricValues?.numerator[index]?.text || '',
          score: this.metricValues?.score[index]?.text || '',
        })) || []
      )
    },
  },
  async created() {
    await this.loadSessionObject()
  },
  methods: {
    async loadSessionObject() {
      // make selection in qlik app then load values
      await this.$qlik.selectFieldValues('SchoolReportKey', [
        { text: this.schoolReportKey },
      ])

      this.metricSessionObject = await this.$qlik.generateHypercubeObjectFromDef(
        calculatorMetricsDef(this.schoolReportKey)
      )

      this.metricSessionObject.addListener('changed', this.update)
      this.update()
    },
    async update() {
      if (this.metricSessionObject) {
        this.metricValues = await this.$qlik.getValuesFromHypercubeObject(
          this.metricSessionObject
        )
      }
    },
  },
}
</script>
