"use client";

import { useEffect, useState } from "react";
import { cooldownRemaining, subscribeCooldown } from "../lib/requestCooldown";

export function useRequestCooldown(scope: string): number {
  const [value, setValue] = useState({ scope, seconds: 0 });
  useEffect(() => {
    const update = () => setValue({ scope, seconds: cooldownRemaining(scope) });
    const initial = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1000);
    const unsubscribe = subscribeCooldown(update);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); unsubscribe(); };
  }, [scope]);
  return value.scope === scope ? value.seconds : 0;
}
