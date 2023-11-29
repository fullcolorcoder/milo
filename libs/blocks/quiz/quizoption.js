import { html } from '../../deps/htm-preact.js';

export const OptionCard = ({
  text, title, image, icon, iconTablet, iconDesktop, options, disabled, selected, background,
}) => {
  const getOptionClass = () => {
    let className = '';
    if (icon || iconTablet || iconDesktop) className += 'has-icon ';
    if (image) className += 'has-image ';
    if (background) className += 'has-background ';
    if (disabled) className += disabled;
    if (selected) className += selected;
    return className;
  };

  const getIconHtml = (iconUrl, iconClass) => html`<div class="quiz-option-icon ${iconClass}">
    <img src="${iconUrl}" alt="Quiz Option Icon" />
  </div>`;

  const imageHtml = html`
    <div class="quiz-option-image" 
      style="background-image: url('${image}')">
    </div>`;

  const titleHtml = html`
    <h3 class="quiz-option-title">${title}</h3>
  `;

  const textHtml = html`
    <p class="quiz-option-text">${text}</p>
  `;

  return html`<button class="quiz-option ${getOptionClass()}" data-option-name="${options}" 
        aria-pressed="${!!selected}" tabindex="${disabled ? '-1' : '0'}">
        ${iconDesktop && getIconHtml(iconDesktop, 'icon-desktop')}
        ${iconTablet && getIconHtml(iconTablet, 'icon-tablet')}
        ${icon && getIconHtml(icon, 'icon-default')}
        ${image && imageHtml}
        <div class="quiz-option-text-container">  
          ${title && titleHtml}
          ${text && textHtml}
        </div>
    </button>`;
};

export const CreateOptions = ({
  options, handleCardSelection, selectedCards, countSelectedCards = 0, maxSelections,
  getOptionsIcons, background,
}) => html`
      ${options?.data.map((option, index) => (
    html`<div key=${index} onClick=${handleCardSelection(option)}>
          <${OptionCard} 
            text=${option.text}
            title=${option.title} 
            icon=${getOptionsIcons(option.options, 'icon')}
            iconTablet=${getOptionsIcons(option.options, 'icon-tablet')}
            iconDesktop=${getOptionsIcons(option.options, 'icon-desktop')}
            image=${getOptionsIcons(option.options, 'image')}
            background=${background}
            options=${option.options}
            selected=${selectedCards[option.options] ? 'selected' : ''}
            disabled=${(countSelectedCards > 0 && !selectedCards[option.options] && countSelectedCards >= maxSelections) ? 'disabled' : ''}/>
        </div>`
  ))}`;

export const GetQuizOption = ({
  btnText, options, minSelections, maxSelections, selectedCards,
  handleOnNextClick, onOptionClick, countSelectedCards, getOptionsIcons,
  btnAnalyticsData, background,
}) => html`
  <div class="quiz-question">
      <div class="quiz-options-container">
        <${CreateOptions} 
          options=${options} 
          selectedCards=${selectedCards}
          countSelectedCards=${countSelectedCards} 
          maxSelections=${maxSelections}
          getOptionsIcons=${getOptionsIcons}
          handleCardSelection=${onOptionClick}
          background=${background} />
      </div>
      <div class="quiz-button-container">
        <button 
          disabled=${countSelectedCards < minSelections && 'disabled'}
          aria-label="Next" 
          class="quiz-button" 
          daa-ll="${btnAnalyticsData}"
          onClick=${() => { handleOnNextClick(selectedCards); }}>
            <span class="quiz-button-label">${btnText}</span>
        </button>
      </div>
  </div>`;
  