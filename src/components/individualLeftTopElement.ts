import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { IndividualObject } from "../states/raw/individual/getIndividualObject";
import { NewDur, TemplatesObj } from "../type";
import { individualElement } from "./individualElement";

interface TopIndividual {
  newDur: NewDur;
  templatesObj: TemplatesObj;
  individualObj?: IndividualObject;
  displayState: string;
}

export const individualLeftTopElement = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, props: TopIndividual) =>
  individualElement("left-top", main, config, props);
