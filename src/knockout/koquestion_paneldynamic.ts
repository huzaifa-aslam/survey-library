import * as ko from "knockout";
import { SurveyElement, Serializer, Question, QuestionFactory,
  QuestionPanelDynamicModel, CssClassBuilder } from "survey-core";
import { QuestionImplementor } from "./koquestion";

export class QuestionPanelDynamicImplementor extends QuestionImplementor {
  koRecalc: any;
  constructor(question: QuestionPanelDynamic) {
    super(question);
    this.koRecalc = ko.observable(0);
    this.setCallbackFunc("koAddPanelClick", () => {
      this.addPanel();
    });
    this.setCallbackFunc("koRemovePanelClick", (data: any) => {
      this.removePanel(data);
    });
    this.setCallbackFunc("koPrevPanelClick", () => {
      this.question.goToPrevPanel();
    });
    this.setCallbackFunc("koNextPanelClick", () => {
      this.question.goToNextPanel();
    });
    this.setObservaleObj(
      "koCanAddPanel",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.canAddPanel;
      })
    );
    this.setObservaleObj(
      "koCanRemovePanel",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.canRemovePanel;
      })
    );
    this.setObservaleObj(
      "koIsPrevButton",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.isPrevButtonShowing;
      })
    );
    this.setObservaleObj(
      "koIsNextButton",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.isNextButtonShowing;
      })
    );
    this.setObservaleObj(
      "koIsRange",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.isRangeShowing;
      })
    );
    this.setObservaleObj(
      "koPanel",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.currentPanel;
      })
    );
    this.setObservaleObj(
      "koIsList",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.isRenderModeList;
      })
    );
    this.setObservaleObj(
      "koIsProgressTop",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.isProgressTopShowing;
      })
    );
    this.setObservaleObj(
      "koIsProgressBottom",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.isProgressBottomShowing;
      })
    );

    const koRangeValue = ko.observable(this.question.currentIndex);
    koRangeValue.subscribe((newValue: any) => {
      this.question.currentIndex = newValue;
    });
    this.setObservaleObj("koRangeValue", koRangeValue);
    this.setObservaleObj(
      "koRangeMax",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.panelCount - 1;
      })
    );

    this.setObservaleObj(
      "koButtonAddRowCss",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.getButtonAddRowCss();
      })
    );

    this.setObservaleObj(
      "koButtonNextCss",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.buttonNextCss;
      })
    );

    this.setObservaleObj(
      "koButtonPrevCss",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.buttonPrevCss;
      })
    );

    this.setObservaleObj(
      "koProgressText",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.question.progressText;
      })
    );

    this.setObservaleObj(
      "koProgress",
      ko.pureComputed(() => {
        this.koRecalc();
        return this.progress;
      })
    );
    this.setCallbackFunc("koPanelAfterRender", (el: any, con: any) => {
      this.panelAfterRender(el, con);
    });
    this.question.panelCountChangedCallback = () => {
      this.onPanelCountChanged();
    };
    this.question.renderModeChangedCallback = () => {
      this.onRenderModeChanged();
    };
    this.question.currentIndexChangedCallback = () => {
      this.onCurrentIndexChanged();
    };
  }
  protected onPanelCountChanged() {
    this.onCurrentIndexChanged();
  }
  protected onRenderModeChanged() {
    this.onCurrentIndexChanged();
  }
  protected onCurrentIndexChanged() {
    if (this.question.isDisposed) return;
    this.koRecalc(this.koRecalc() + 1);
    this.question.koRangeValue(
      this.question.currentIndex
    );
  }
  protected addPanel() {
    this.question.addPanelUI();
  }
  protected removePanel(val: any) {
    if (!this.question.isRenderModeList) {
      val = this.question.currentPanel;
    }
    this.question.removePanelUI(val);
  }
  private panelAfterRender(elements: any, con: any) {
    if (!this.question || !this.question.survey) return;
    const el = SurveyElement.GetFirstNonTextElement(elements);
    this.question.survey.afterRenderPanel(con, el);
  }

  protected get buttonPrevCss() {
    const cssClasses = this.question.cssClasses;
    return new CssClassBuilder()
      .append(cssClasses.buttonPrev)
      .append(cssClasses.buttonPrev + "--disabled", !this.question.isPrevButtonShowing)
      .toString();
  }

  protected get buttonNextCss() {
    return new CssClassBuilder()
      .append(this.question.cssClasses.buttonNext)
      .append(this.question.cssClasses.buttonNext + "--disabled", !this.question.isNextButtonShowing)
      .toString();
  }

  protected get progress() {
    const rangeMax: number = this.question.panelCount - 1;
    return (this.question.currentIndex / rangeMax) * 100 + "%";
  }
  public dispose() {
    this.question.panelCountChangedCallback = undefined;
    this.question.renderModeChangedCallback = undefined;
    this.question.currentIndexChangedCallback = undefined;
    super.dispose();
  }
}

export class QuestionPanelDynamic extends QuestionPanelDynamicModel {
  private _implementor: QuestionPanelDynamicImplementor;
  constructor(name: string) {
    super(name);
  }
  protected onBaseCreating() {
    super.onBaseCreating();
    this._implementor = new QuestionPanelDynamicImplementor(this);
  }
  public dispose() {
    this._implementor.dispose();
    this._implementor = undefined;
    super.dispose();
  }
}

Serializer.overrideClassCreator("paneldynamic", function() {
  return new QuestionPanelDynamic("");
});

QuestionFactory.Instance.registerQuestion("paneldynamic", (name) => {
  return new QuestionPanelDynamic(name);
});
