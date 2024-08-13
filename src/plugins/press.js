function GetCross(p1, p2, p) {
  return (p2.x - p1.x) * (p.y - p1.y) - (p.x - p1.x) * (p2.y - p1.y);
}

function IsPointInMatrix(p1, p2, p3, p4, p) {
  let isPointIn =
    GetCross(p1, p2, p) * GetCross(p3, p4, p) >= 0 &&
    GetCross(p2, p3, p) * GetCross(p4, p1, p) >= 0;
  return isPointIn;
}

function isPress(e, self) {
  let clientRect = e.target.getBoundingClientRect();
  const p1 = { x: clientRect.left, y: clientRect.top };
  const p2 = { x: clientRect.left + e.target.offsetWidth, y: clientRect.top };
  const p3 = {
    x: clientRect.left + e.target.offsetWidth,
    y: clientRect.top + e.target.offsetHeight,
  };
  const p4 = { x: clientRect.left, y: clientRect.top + e.target.offsetHeight };
  const p5 = { x: self.pageX, y: self.pageY };
  return IsPointInMatrix(p1, p2, p3, p4, p5);
}

function touchstart(e, self) {
  e.preventDefault();
  const touches = e.touches[0];
  if (!touches) return;
  const { pressObj } = self;
  pressObj.pageX = touches.pageX;
  pressObj.pageY = touches.pageY;
  pressObj.clientX = touches.clientX;
  pressObj.clientY = touches.clientY;
  self.touchstart(e);
}

function touchend(e, self) {
  e.preventDefault();
  const touches = e.changedTouches[0];
  if (!touches) return;
  if (isPress(e, touches)) {
    self.touchend(e);
  } else {
    self.touchcancel(e);
  }
}

function touchcancel(e, self) {
  e.preventDefault();
  self.touchcancel(e);
}

const press = {
  bind(el, binding) {
    el.pressObj = {};

    el.touchstart = function (e) {
      const { value } = binding;
      const {
        methods: { start },
      } = value;
      if (!start) return;
      value.event = e;
      start.call(this, value);
    };

    el.touchend = function (e) {
      const { value } = binding;
      const {
        methods: { end },
      } = value;
      if (!end) return;
      value.event = e;

      if (!value && el.href && !binding.modifiers.prevent) {
        return (window.location = el.href);
      }
      const tagName = value.event.target.tagName.toLocaleLowerCase();

      if (tagName === 'input' || tagName === 'textarea') {
        return value.event.target.focus();
      }
      end.call(this, value);
    };

    el.touchcancel = function (e) {
      const { value } = binding;
      const {
        methods: { cancel },
      } = value;
      if (!cancel) return;
      value.event = e;

      if (!value && el.href && !binding.modifiers.prevent) {
        return (window.location = el.href);
      }
      cancel.call(this, value);
    };

    el.addEventListener(
      'touchstart',
      e => {
        if (binding.modifiers.stop) {
          e.stopPropagation();
        }
        if (binding.modifiers.prevent) {
          e.preventDefault();
        }
        touchstart(e, el);
      },
      false
    );

    el.addEventListener(
      'touchend',
      e => {
        // const { value: { distance = 10 }} = binding;
        try {
          Object.defineProperty(e, 'currentTarget', {
            value: el,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        } catch (err) {
          // NOTE: ios7下对e.currentTarget用defineProperty报错
          e.currentTarget = el;
        }
        e.preventDefault();
        // el.distance = distance < 10 ? 10 : distance;
        touchend(e, el);
      },
      false
    );

    el.addEventListener(
      'touchcancel',
      e => {
        try {
          Object.defineProperty(e, 'currentTarget', {
            value: el,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        } catch (err) {
          // NOTE: ios7下对e.currentTarget用defineProperty报错
          e.currentTarget = el;
        }
        e.preventDefault();
        touchcancel(e, el);
      },
      false
    );
  },
  unbind(el) {
    el.touchstart = () => {};
    el.touchend = () => {};
    el.touchcancel = () => {};
  },
};

const install = Vue => {
  Vue.directive('press', press);
};

export default { install };
