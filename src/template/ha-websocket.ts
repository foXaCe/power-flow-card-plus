import type { Connection, UnsubscribeFunc } from "home-assistant-js-websocket";

type ConnectionLike = Pick<Connection, "subscribeMessage">;

interface TemplateListeners {
  all: boolean;
  domains: string[];
  entities: string[];
  time: boolean;
}
export interface RenderTemplateResult {
  result: string;
  listeners: TemplateListeners;
}

export const subscribeRenderTemplate = (
  conn: ConnectionLike,
  onChange: (result: RenderTemplateResult) => void,
  params: {
    template: string;
    entity_ids?: string | string[];
    variables?: Record<string, unknown>;
    timeout?: number;
    strict?: boolean;
  }
): Promise<UnsubscribeFunc> =>
  conn.subscribeMessage(onChange, {
    type: "render_template",
    ...params,
  });
