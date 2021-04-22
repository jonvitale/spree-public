<template>
  <nav>
    <ul class="flex flex-wrap md:flex-no-wrap justify-between mb-4 text-sm">
      <NavigationItem label="Overview" link="/" exact />
      <!-- <NavigationItem label="Annual Data" link="/annual" /> -->
      <!-- <NavigationItem label="Trend Data" link="/trends" /> -->
      <!-- <NavigationItem label="School Report" :link="schoolReport_route" /> -->
      <NavigationItem label="Calculator" :link="schoolCalculatorRoute" />
    </ul>
  </nav>
</template>

<script>
import NavigationItem from '~sdp-components/Navigation/NavigationItem'

export default {
  components: {
    NavigationItem,
  },
  computed: {
    schoolReportRoute() {
      const slugReport = this.$store.state.selections.slugReport
      if (slugReport.length) {
        return '/report/' + slugReport
      } else {
        return '/report'
      }
    },
    schoolCalculatorRoute() {
      const slugReport = this.$store.state.selections.slugReport
      if (slugReport) {
        return '/calculator/' + slugReport
      } else {
        return '/calculator'
      }
    },
  },
}
</script>
