<template>
  <td
    :class="cell.className"
    :title="getHeaders()"
    :style="getCellStyle()"
    :colspan="cell.colSpans"
  >
    <sv-action-bar
      v-if="cell.isActionsCell"
      :model="cell.item.getData()"
      :handleClick="false"
    ></sv-action-bar>
    <component
      v-if="cell.hasPanel"
      :is="getComponentName(cell.panel)"
      :question="cell.panel"
      :css="question.survey.css"
    ></component>
    <div v-if="cell.hasQuestion">
      <survey-errors
        v-if="hasErrorsOnTop"
        :element="cell.question"
        :location="'top'"
      />
      <component
        v-if="!cell.isChoice && cell.question.isDefaultRendering()"
        v-show="isVisible"
        :is="getComponentName(cell.question)"
        :question="cell.question"
      />
      <component
        v-if="!cell.isChoice && !cell.question.isDefaultRendering()"
        v-show="isVisible"
        :is="cell.question.getComponentName()"
        :question="cell.question"
      />
      <survey-radiogroup-item
        v-if="cell.isChoice && !cell.isCheckbox"
        :key="cell.item.value"
        :class="getItemClass(cell.item)"
        :question="cell.question"
        :item="cell.item"
        :index="'' + cell.index"
        :hideLabel="true"
      ></survey-radiogroup-item>
      <survey-checkbox-item
        v-if="cell.isChoice && cell.isCheckbox"
        :key="cell.item.value"
        :class="getItemClass(cell.item)"
        :question="cell.question"
        :item="cell.item"
        :index="'' + cell.index"
        :hideLabel="true"
      ></survey-checkbox-item>
      <survey-errors
        v-if="hasErrorsOnBottom"
        :element="cell.question"
        :location="'bottom'"
      />
    </div>
    <survey-string v-if="cell.hasTitle" :locString="cell.locTitle" />
    <span v-if="!!cell.requiredText">{{ cell.requiredText }}</span>
  </td>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { Question, QuestionMatrixDropdownRenderedCell, CssClassBuilder } from "survey-core";

@Component
export class MatrixCell extends Vue {
  @Prop() question: Question;
  @Prop() cell: QuestionMatrixDropdownRenderedCell;

  isVisible: boolean = false;
  getComponentName(element: Question) {
    if (element.customWidget) {
      return "survey-customwidget";
    }
    return "survey-" + element.getType();
  }
  get hasErrorsOnTop() {
    return this.cell.showErrorOnTop;
  }
  get hasErrorsOnBottom() {
    return this.cell.showErrorOnBottom;
  }
  getHeaders(): string {
    return this.cell.headers;
  }
  getCellStyle() {
    if (!!this.cell.width || !!this.cell.minWidth)
      return { width: this.cell.width, minWidth: this.cell.minWidth };
    return null;
  }
  getItemClass(item: any) {
    const cssClasses = this.cell.question.cssClasses;
    const isDisabled = this.cell.question.isReadOnly || !item.isEnabled;
    const isChecked = item.value === this.cell.question.renderedValue;
    const allowHover = !isDisabled && !isChecked;

    return new CssClassBuilder()
      .append(this.cell.question.cssClasses.item)
      .append(cssClasses.itemDisabled, isDisabled)
      .append(cssClasses.itemChecked, isChecked)
      .append(cssClasses.itemHover, allowHover)
      .toString();
  }
  mounted() {
    if (!this.cell.hasQuestion || !this.question || !this.question.survey)
      return;
    this.onVisibilityChanged();
    var self = this;
    this.cell.question.registerFunctionOnPropertyValueChanged(
      "isVisible",
      function () {
        self.onVisibilityChanged();
      }
    );
    var options = {
      cell: this.cell.cell,
      cellQuestion: this.cell.question,
      htmlElement: this.$el,
      row: this.cell.row,
      column: this.cell.cell.column,
    };
    this.question.survey.matrixAfterCellRender(this.question, options);
  }
  private onVisibilityChanged() {
    this.isVisible = this.cell.question.isVisible;
  }
}

Vue.component("survey-matrixcell", MatrixCell);
export default MatrixCell;
</script>
