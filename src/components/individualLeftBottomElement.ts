import { PowerFlowCardPlus } from "../power-flow-card-plus";
import { PowerFlowCardPlusConfig } from "../power-flow-card-plus-config";
import { IndividualObject } from "../states/raw/individual/getIndividualObject";
import { NewDur, TemplatesObj } from "../type";
import { individualElement } from "./individualElement";

interface IndividualBottom {
  newDur: NewDur;
  templatesObj: TemplatesObj;
  individualObj?: IndividualObject;
  displayState: string;
}

export const individualLeftBottomElement = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, props: IndividualBottom) =>
  individualElement("left-bottom", main, config, props);
