<template>
  <div style="clear: both" :class="this.cssClass">
    <div :class="question.cssClasses.progressContainer">
      <div :title="question.panelPrevText">
        <svg
          viewBox="0 0 10 10"
          :class="question.getPrevButtonCss()"
          @click="prevPanelClick"
        >
          <polygon points="2,2 0,4 5,9 10,4 8,2 5,5 " />
        </svg>
      </div>

      <div :class="question.cssClasses.progress" v-if="question.isRangeShowing">
        <div
          :class="question.cssClasses.progressBar"
          :style="{ width: progress }"
          role="progressbar"
        ></div>
      </div>

      <div :title="question.panelNextText">
        <svg
          viewBox="0 0 10 10"
          @click="nextPanelClick"
          :class="question.getNextButtonCss()"
        >
          <polygon points="2,2 0,4 5,9 10,4 8,2 5,5 " />
        </svg>
      </div>
    </div>

    <button
      type="button"
      v-if="question.canAddPanel"
      :class="question.getAddButtonCss()"
      @click="addPanelClick"
    >
      <span :class="question.cssClasses.buttonAddText">
        {{ question.panelAddText }}
      </span>
    </button>

    <div :class="question.cssClasses.progressText">
      {{ question.progressText }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { Question, QuestionPanelDynamicModel, CssClassBuilder } from "survey-core";


@Component
export class PanelDynamicProgress extends Vue {
  @Prop() question: QuestionPanelDynamicModel;

  get cssClass() {
    return this.question.isProgressTopShowing
      ? this.question.cssClasses.progressTop
      : this.question.cssClasses.progressBottom;
  }
  get rangeMax() {
    return this.question.panelCount - 1;
  }
  addPanelClick() {
    this.question.addPanelUI();
  }
  prevPanelClick() {
    this.question.goToPrevPanel();
  }
  nextPanelClick() {
    this.question.goToNextPanel();
  }

  changeRange(event: any) {
    this.question.currentIndex = event.target.value;
  }

  get progress() {
    return (this.question.currentIndex / this.rangeMax) * 100 + "%";
  }
}

Vue.component("survey-paneldynamicprogress", PanelDynamicProgress);
export default PanelDynamicProgress;
</script>
