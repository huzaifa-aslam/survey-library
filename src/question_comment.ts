import { Question } from "./question";
import { Serializer } from "./jsonobject";
import { QuestionFactory } from "./questionfactory";
import { LocalizableString } from "./localizablestring";
import { QuestionTextBase } from "./question_textbase";
import { increaseHeightByContent } from "./utils/utils";

/**
 * A Model for a comment question
 */
export class QuestionCommentModel extends QuestionTextBase {
  private element: HTMLElement;
  /**
   * The html rows attribute.
   */
  public get rows(): number {
    return this.getPropertyValue("rows");
  }
  public set rows(val: number) {
    this.setPropertyValue("rows", val);
  }
  /**
   * The html cols attribute.
   */
  public get cols(): number {
    return this.getPropertyValue("cols");
  }
  public set cols(val: number) {
    this.setPropertyValue("cols", val);
  }
  /**
   * Returns or sets a boolean that specifies whether a question can accept and display multiple lines of text.
   */
  public get multiLine(): boolean {
    return this.getPropertyValue("multiLine");
  }
  public set multiLine(val: boolean) {
    this.setPropertyValue("multiLine", val);
  }
  /**
   * Specifies whether the question's text area automatically expands its height to avoid the vertical scrollbar and to display the entire multi-line contents entered by respondents.
   * Default value is false.
   * @see SurveyModel.autoGrowComment
   */
  public get autoGrow(): boolean {
    return this.getPropertyValue("autoGrow") || (this.survey && this.survey.autoGrowComment);
  }
  public set autoGrow(val: boolean) {
    this.setPropertyValue("autoGrow", val);
  }
  public getType(): string {
    return "comment";
  }
  public afterRenderQuestionElement(el: HTMLElement): void {
    this.element = document.getElementById(this.inputId) || el;
    this.updateElement();
    super.afterRenderQuestionElement(el);
  }
  public updateElement(): void {
    if (this.element && this.autoGrow) {
      setTimeout(() => increaseHeightByContent(this.element), 1);
    }
  }
  public onInput(event: any): void {
    if (this.isInputTextUpdate)
      this.value = event.target.value;
    else
      this.updateElement();
  }
  public onKeyDown(event: any): void {
    if (!this.multiLine && (event.key === "Enter" || event.keyCode === 13)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  onValueChanged(): void {
    super.onValueChanged();
    this.updateElement();
  }
  protected setNewValue(newValue: string): any {
    if (!this.multiLine) {
      // eslint-disable-next-line no-control-regex
      newValue = newValue.replace(new RegExp("(\r\n|\n|\r)", "gm"), "");
    }
    super.setNewValue(newValue);
  }
}
Serializer.addClass(
  "comment",
  [
    { name: "maxLength:number", default: -1 },
    { name: "cols:number", default: 50 },
    { name: "rows:number", default: 4 },
    { name: "placeHolder", serializationProperty: "locPlaceHolder" },
    {
      name: "textUpdateMode",
      default: "default",
      choices: ["default", "onBlur", "onTyping"],
    },
    { name: "autoGrow:boolean" },
    { name: "multiLine:boolean", default: true }
  ],
  function () {
    return new QuestionCommentModel("");
  },
  "textbase"
);
QuestionFactory.Instance.registerQuestion("comment", (name) => {
  return new QuestionCommentModel(name);
});
