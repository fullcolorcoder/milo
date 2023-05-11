import { html, useMemo } from '../../deps/htm-preact.js';

function StepIndicator({ currentStep, totalSteps, prevStepIndicator = [] }) {
  const dotIndicators = useMemo(() => {
    const dots = [];

    for (let index = 0; index < totalSteps; index++) {
      let className;
      switch (true) {
        case index === currentStep:
          className = 'current';
          break;
        case prevStepIndicator.includes(index):
          className = 'prev';
          break;
        default:
          className = 'future';
      }
      dots.push(html`<div class="dot ${className}"></div>`);
    }

    return html`
      <div class="dot-indicators ${totalSteps > 3 ? 'dot-indicators--wide' : ''}">
        ${dots}
      </div>
    `;
  }, [currentStep, totalSteps, prevStepIndicator]);

  return dotIndicators;
}

export default StepIndicator;
