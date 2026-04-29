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
  battery: any;
  individualObjs: IndividualObject[];
}

export const individualRightBottomElement = (main: PowerFlowCardPlus, config: PowerFlowCardPlusConfig, props: TopIndividual) =>
  individualElement("right-bottom", main, config, props);
