import { html, useContext, useState } from '../../deps/htm-preact.js';
import { ConfiguratorContext, stateReform } from './context.js'
import { utf8ToB64 } from '../../utils/utils.js';

export const Select = ({ label, options, prop, onChange, sort }) => {
  const context = useContext(ConfiguratorContext);
  const onSelectChange = (e) => {
    context.dispatch({
      type: 'SELECT_CHANGE',
      prop,
      value: e.target.value,
    });
    if (typeof onChange === 'function') {
      onChange();
    }
  };
  const optionsArray = sort ? sortObjects(options) : Object.entries(options);
  return html`
      <div class="field">
        <label for=${prop}>${label}</label>
        <select id=${prop} value=${context.state?.[prop]} onChange=${onSelectChange}>
          ${optionsArray.map(([v, l]) => html`<option value="${v}">${l} (${v})</option>`)}
        </select>
      </div>
    `;
};

export const Input = ({ label = '', type = 'text', prop, placeholder }) => {
  const context = useContext(ConfiguratorContext);
  const onInputChange = (e) => {
    context.dispatch({
      type: 'INPUT_CHANGE',
      prop,
      value: type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const defaultValue = type === 'checkbox' ? false : '';
  const value = { [type === 'checkbox' ? 'checked' : 'value']: context.state?.[prop] || defaultValue };
  return html` <div class="field">
      <label for=${prop}>${label}</label>
      <input type=${type} id=${prop} name=${prop} ...${value} placeholder=${placeholder} onChange=${onInputChange} />
    </div>`;
};


export const CopyBtn = () => {
  const { state } = useContext(ConfiguratorContext);
  const [isError, setIsError] = useState();
  const [isSuccess, setIsSuccess] = useState();
  const [errorMessage, setErrorMessage] = useState('Failed to Copy.');
  const [showConfigUrl, setShowConfigUrl] = useState(false);

  // debug
  const [configUrl, setConfigUrl] = useState('');

  const setStatus = (setFn, status = true) => {
    setFn(status);
    setTimeout(() => {
      setFn(!status);
    }, 2000);
  };

  const configFormValidation = () => {
    let inputValuesFilled = true;
    const testInputs = document.querySelectorAll('#form_id, #base_url, #munchkin_id, #destination_url');
    const requiredPanelExpandButton = document.querySelector('#ai_Marketo_Form_Config_Fileds button[aria-label=Expand]');
    testInputs.forEach((input) => {
      if (!input.value) {
        inputValuesFilled = false;
        if (requiredPanelExpandButton) {
          requiredPanelExpandButton.click();
        }
        input.focus();
      }
    });
    return inputValuesFilled;
  };

  const getUrl = () => {
    const url = window.location.href.split('#')[0];
    return `${url}#${utf8ToB64(JSON.stringify(stateReform(state)))}`;
  };

  const copyConfig = () => {
    setConfigUrl(getUrl());
    if (!navigator?.clipboard) {
      setStatus(setIsError);
      setShowConfigUrl(false);
      return;
    }
    if (!configFormValidation()) {
      setErrorMessage('Required fields must be filled');
      setStatus(setIsError);
      setShowConfigUrl(false);
      return;
    }

    const linkTitle = document.getElementById('title').value;
    const formId = document.getElementById('form_id').value;
    const link = document.createElement('a');
    link.href = getUrl();
    link.textContent = `Marketo Form - ${linkTitle || formId}`;

    const blob = new Blob([link.outerHTML], { type: 'text/html' });
    // eslint-disable-next-line no-undef
    const data = [new ClipboardItem({ [blob.type]: blob })];
    navigator.clipboard.write(data)
      .then(() => {
        setStatus(setIsSuccess);
        setErrorMessage('Failed to copy.');
        setShowConfigUrl(true);
      }, () => {
        setStatus(setIsError);
        setShowConfigUrl(false);
      });
  };

  return html`
  <textarea class=${`config-url ${showConfigUrl ? '' : 'hide'}`}>${configUrl}</textarea>
  <button
    class="copy-config"
    onClick=${copyConfig}>Copy</button>
  <div class="copy-message ${isError === true ? 'is-error' : ''} ${isSuccess === true ? 'is-success' : ''}">
    <div class="success-message">Copied to clipboard!</div>
    <div class="error-message">${errorMessage}</div>
  </div>`;
};
