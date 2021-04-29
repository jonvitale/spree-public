<template>
  <div style="height: 3rem">
    <div class="flex flex-row">
      <div class="relative b-endtext text-center" style="top: 1rem">
        {{ metric.min || 0 }}
      </div>
      <!-- The range is in front, a div is in back -->
      <div class="b-slider">
        <div class="b-slider__track">
          <div
            class="relative"
            :style="{
              left: `${100 * score}%`,
            }"
          >
            <input
              v-if="isEditingText"
              :value="metric.numerator"
              type="text"
              @change="
                $emit('input', $event.target.value, metric, overallMetric)
              "
            />
            <span v-else @click="isEditingText = true">
              {{ num(metric.numerator) }}
            </span>
          </div>
        </div>
        <div class="relative">
          <div
            class="absolute"
            style="top: -0.2rem; height: 1.4rem"
            :style="{
              left: `${100 * metric.targetAt}%`,
              'border-left': `3px solid ${tierColor(1, false, 'at')}`,
            }"
          />
          <div
            class="absolute"
            style="top: -0.2rem; height: 1.4rem"
            :style="{
              left: `${100 * metric.targetApproaching}%`,
              'border-left': `3px solid ${tierColor(1, false, 'approaching')}`,
            }"
          />
          <div
            class="absolute"
            style="top: -0.2rem; height: 1.4rem"
            :style="{
              left: `${100 * metric.targetAbove}%`,
              'border-left': `3px solid ${tierColor(1, false, 'above')}`,
            }"
          />
          <div class="relative b-slider__reference-track">
            <!-- referenceScore -->
            <div
              class="absolute b-slider__reference-marker z-1"
              :style="{
                left: `${100 * referenceScore}%`,
                top: '2px',
                background: referenceTierColor(),
              }"
            />
          </div>
          <input
            type="range"
            min="0"
            :max="metric.denominator"
            :value="metric.numerator"
            class="absolute z-10"
            :style="{
              '--track-background-color': 'transparent',
              '--thumb-color': tierColor(),
              '--thumb-light-color': tierColor(1, true),
            }"
            @input="$emit('input', $event.target.value, metric, overallMetric)"
          />
        </div>
        <div class="relative b-slider__track">
          <div
            v-if="metric.numerator !== metric.originalNumerator"
            class="absolute text-gray-600 text-xs"
            :style="{
              left: `${100 * referenceScore}%`,
              top: '15px',
            }"
          >
            {{ num(metric.originalNumerator) }}
          </div>
        </div>
      </div>
      <div class="relative b-endtext text-left ml-1" style="top: 1rem">
        {{ num(metric.denominator) }}
      </div>
    </div>
  </div>
</template>
<script>
const rgbLight = {
  below: {
    r: 223,
    g: 166,
    b: 164,
  },
  approaching: {
    r: 251,
    g: 202,
    b: 162,
  },
  at: {
    r: 102,
    g: 255,
    b: 171,
  },
  above: {
    r: 133,
    g: 204,
    b: 255,
  },
  none: {
    r: 125,
    g: 125,
    b: 125,
  },
}

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

export default {
  props: {
    // a nested object with (at least) a numerator, denomonitor, score
    metric: {
      type: Object,
      required: true,
    },
    // for subgroup level metrics (e.g. Asian subgroup of a metric)
    // use this prop as a reference to the parent metric
    overallMetric: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      isEditingText: false,
    }
  },
  computed: {
    score() {
      return this.metric.numerator / this.metric.denominator
    },
    referenceScore() {
      return this.metric.originalNumerator / this.metric.denominator
    },
    tier() {
      return this.metric.score < this.metric.targetApproaching
        ? 'below'
        : this.metric.score < this.metric.targetAt
        ? 'approaching'
        : this.metric.score < this.metric.targetAbove
        ? 'at'
        : this.metric.score >= this.metric.targetAbove
        ? 'above'
        : 'none'
    },
    referenceTier() {
      return this.metric.originalScore < this.metric.targetApproaching
        ? 'below'
        : this.metric.originalScore < this.metric.targetAt
        ? 'approaching'
        : this.metric.originalScore < this.metric.targetAbove
        ? 'at'
        : this.metric.originalScore >= this.metric.targetAbove
        ? 'above'
        : 'none'
    },
  },
  methods: {
    tierColor(opacity, lighten, tier) {
      tier = tier || this.tier
      const { r, g, b } = lighten ? rgbLight[tier] : rgbDefault[tier]
      return `rgba(${r},${g},${b},${opacity || 1})`
    },
    referenceTierColor(opacity, lighten) {
      const { r, g, b } = lighten
        ? rgbLight[this.referenceTier]
        : rgbDefault[this.referenceTier]
      return `rgba(${r},${g},${b},${opacity || 1})`
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
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}

.b-endtext {
  font-size: 9pt;
  width: 3em;
}

.b-slider {
  width: calc(100% - 6em);
}
.b-slider__track {
  width: calc(100% - 15px);
}

.b-slider__reference-track {
  width: calc(100% - 12px);
}

.b-slider__reference-marker {
  width: 12px;
  height: 12px;
  cursor: none;
  /* border: 1.5px solid #fafafa; */
  /* background: white; */
  /* box-shadow: 2px 2px 1px #605E5C; */
  border-radius: 50%;
}

input[type='range'] {
  -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
  width: 100%; /* Specific width is required for Firefox. */
  background: transparent; /* Otherwise white in Chrome */
}

input[type='range']::-ms-track {
  width: 100%;
  cursor: pointer;

  /* Hides the slider so custom styles can be added */
  background: transparent;
  border-color: transparent;
  color: transparent;
}

input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 15px;
  cursor: pointer;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2),
    inset -1px -1px 3px rgba(220, 220, 240, 0.5);
  background: var(--track-background-color);
  border-radius: 1.3px;
  /* border: 0.2px solid #010101; */
}

input[type='range']:focus::-webkit-slider-runnable-track {
  background: var(--track-background-color);
}

input[type='range']::-moz-range-track {
  width: 100%;
  height: 15px;
  cursor: pointer;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2),
    inset -2px -2px 3px rgba(220, 220, 220, 0.5);
  background: var(--track-background-color);
  border-radius: 1.3px;
  /* border: 0.2px solid #010101; */
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  cursor: ew-resize;
  /* border: 1px solid var(--thumbColor); */
  background: var(--thumb-color);
  /* background: radial-gradient(circle at 33% 33%, var(--thumb-light-color) 10%, var(--thumb-color) 80%); */
  box-shadow: 0 0 2px 3px var(--thumb-light-color);
  border-radius: 50%;
  /* transition: pulse 2s infinite; */
}

input[type='range']::-moz-range-thumb {
  appearance: none;
  width: 15px;
  height: 15px;
  cursor: ew-resize;
  /* border: 1px solid #444444; */
  background: var(--thumb-color);
  box-shadow: 0 2px 3px var(--thumb-light-color);
  border-radius: 50%;
  /* animation: pulse 2s infinite; */
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 1px 0 var(--thumb-light-color);
  }
  50% {
    box-shadow: 0 0 3px 6px var(--thumb-light-color);
  }
  100% {
    box-shadow: 0 0 1px 0 var(--thumb-light-color);
  }
}
</style>
