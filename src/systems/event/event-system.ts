import type { GameState } from "../../game/game-state";

export type GameEvent = {
  id: string;
  name: string;
  description: string;
  effect: (state: GameState) => void;
};

const DAILY_EVENTS: GameEvent[] = [
  {
    id: "rainy_day",
    name: "酸雨夜",
    description: "今晚下起了腐蚀性酸雨，客人偏好更平滑和温暖的饮料。",
    effect: (state) => {
      // 降低容错率，或者对特定操作进行加成
      // TODO: Event modifier
    }
  },
  {
    id: "ice_shortage",
    name: "冷链故障",
    description: "酒吧区域的制冰机供应链出现问题，今天最好省着用冰。",
    effect: (state) => {
      // TODO: Event modifier
    }
  },
  {
    id: "streamer",
    name: "网红探店",
    description: "有赛博博主在店里直播，完美调酒的小费翻倍，失败扣分加剧。",
    effect: (state) => {
      // TODO: Event modifier
    }
  }
];

export function pickDailyEvent(state: GameState): GameEvent | null {
  // Clear previous day's event first
  state.activeEvent = null;

  // 第 1 天不触发事件，作为教学缓冲
  if (state.day <= 1) return null;
  
  // 50% 概率触发事件
  if (Math.random() > 0.5) return null;
  
  const index = Math.floor(Math.random() * DAILY_EVENTS.length);
  const event = DAILY_EVENTS[index];
  
  state.activeEvent = event.id;
  event.effect(state);
  
  return event;
}

export function getEventDescription(eventId: string | null): string {
  if (!eventId) return "又是平常的一夜...";
  const event = DAILY_EVENTS.find(e => e.id === eventId);
  return event ? `【${event.name}】: ${event.description}` : "又是平常的一夜...";
}
