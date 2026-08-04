function normalizeLongPressOptions(value) {
  if (typeof value === "function") {
    return { enabled: true, delay: 500, handler: value, respectChildStop: true };
  }
  if (!value || typeof value !== "object") {
    return { enabled: false, delay: 500, handler: null, respectChildStop: true };
  }
  let options = {
    enabled: value.enabled !== false,
    delay: value.delay || 500,
    handler: typeof value.handler === "function" ? value.handler : null,
    // 默认 true：尊重子组件 touchstart.stop，不在 capture 阶段旁听
    respectChildStop: value.respectChildStop !== false,
  };
  // console.log('options', options);
  return options;
}

function clearLongPressTimer(el) {
  if (el._longPressTimer) {
    clearTimeout(el._longPressTimer);
    el._longPressTimer = null;
  }
}

function teardownLongPress(el) {
  clearLongPressTimer(el);
  const handlers = el._lpHandlers;
  if (!handlers) {
    return;
  }
  const capture = el._lpUseCapture === true;
  el.removeEventListener("touchstart", handlers.onStart, capture);
  if (handlers.onStartBubble) {
    el.removeEventListener("touchstart", handlers.onStartBubble);
  }
  el.removeEventListener("touchmove", handlers.onMove, capture);
  el.removeEventListener("touchend", handlers.onEnd, capture);
  el.removeEventListener("touchcancel", handlers.onEnd, capture);
  el.removeEventListener("mousedown", handlers.onStart, capture);
  if (handlers.onStartBubble) {
    el.removeEventListener("mousedown", handlers.onStartBubble);
  }
  el.removeEventListener("mouseup", handlers.onEnd, capture);
  el.removeEventListener("mouseleave", handlers.onEnd);
  el.removeEventListener("click", handlers.onClickCapture, true);
  el._lpHandlers = null;
  el._longPressOpts = null;
  el._lpUseCapture = false;
}

function setupLongPress(el, binding, vnode) {
  teardownLongPress(el);
  const opts = normalizeLongPressOptions(binding.value);
  el._longPressOpts = opts;
  if (!opts.handler) {
    return;
  }

  const useCapture = opts.respectChildStop === false;
  el._lpUseCapture = useCapture;

  let startX = 0;
  let startY = 0;
  const moveThreshold = 10;

  const isActive = () => {
    const current = el._longPressOpts;
    return current && current.enabled && current.handler;
  };

  const startTimer = (e) => {
    if (!isActive()) {
      return;
    }
    const pt = e.touches ? e.touches[0] : e;
    startX = pt.clientX;
    startY = pt.clientY;
    clearLongPressTimer(el);
    el._longPressTimer = setTimeout(() => {
      el._longPressTimer = null;
      el._longPressFired = true;
      const current = el._longPressOpts;
      const ctx = vnode.context;
      current.handler.call(ctx, e, ctx);
    }, el._longPressOpts.delay || 500);
  };

  const onStart = (e) => {
    startTimer(e);
    if (isActive()) {
      e.stopPropagation();
    }
  };

  const onStartBubble = useCapture
    ? (e) => {
        if (!isActive()) {
          return;
        }
        e.stopPropagation();
      }
    : null;

  const onMove = (e) => {
    if (!el._longPressTimer || !e.touches) {
      return;
    }
    const t = e.touches[0];
    if (Math.abs(t.clientX - startX) > moveThreshold || Math.abs(t.clientY - startY) > moveThreshold) {
      clearLongPressTimer(el);
    }
  };

  const onEnd = () => {
    clearLongPressTimer(el);
  };

  const onClickCapture = (e) => {
    if (!el._longPressFired) {
      return;
    }
    el._longPressFired = false;
    e.stopImmediatePropagation();
    e.preventDefault();
  };

  el._lpHandlers = { onStart, onStartBubble, onMove, onEnd, onClickCapture };

  if (useCapture) {
    el.addEventListener("touchstart", onStart, { passive: true, capture: true });
    el.addEventListener("touchstart", onStartBubble, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true, capture: true });
    el.addEventListener("touchend", onEnd, true);
    el.addEventListener("touchcancel", onEnd, true);
    el.addEventListener("mousedown", onStart, true);
    el.addEventListener("mousedown", onStartBubble);
    el.addEventListener("mouseup", onEnd, true);
  } else {
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    el.addEventListener("mousedown", onStart);
    el.addEventListener("mouseup", onEnd);
  }
  el.addEventListener("mouseleave", onEnd);
  el.addEventListener("click", onClickCapture, true);
}

let longPressMixin = {
  directives: {
    longpress: {
      bind(el, binding, vnode) {
        setupLongPress(el, binding, vnode);
      },
      update(el, binding, vnode) {
        const next = normalizeLongPressOptions(binding.value);
        const prev = el._longPressOpts;
        const modeChanged = prev && prev.respectChildStop !== next.respectChildStop;
        el._longPressOpts = next;
        if (modeChanged || !el._lpHandlers) {
          setupLongPress(el, binding, vnode);
        }
      },
      unbind(el) {
        teardownLongPress(el);
      },
    },
  },
};
