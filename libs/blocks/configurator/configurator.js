import { html, render, useContext, useState, useEffect } from '../../deps/htm-preact.js';
import { loadStyle, loadBlock, createTag } from '../../utils/utils.js';
import { Input, Select, CopyBtn } from './components.js'
import { ConfiguratorContext, ConfiguratorProvider, stateReform, saveStateToLocalStorage } from './context.js';
import Accordion from '../../ui/controls/Accordion.js';
import { utf8ToB64 } from '../../utils/utils.js';

export async function fetchData(url) {
  const resp = await fetch(url.toLowerCase());

  if (!resp.ok) return {};

  const json = await resp.json();
  return json;
}

const getDefaults = (panelsData) => {
  let defaultState = {};

  panelsData[':names'].forEach(panelName => {
    const panelData = panelsData[panelName];
    panelData.data.forEach(field => {
      const prop = field.prop.toLowerCase();
      defaultState[prop] = field.default || '';
    });
  });
  console.log('defaultState', defaultState);
  return defaultState;
};

const getFields = (fieldsData) => {
  return fieldsData.map((field) => {
    const prop = field.prop.toLowerCase();

    if (!field.options) {
      return html`
        <${Input} label=${field.label} prop=${prop} type="text" />
      `;
    }
    let options = {};
    try {
      options = JSON.parse(field.options);
    } catch {

      const keyValuePairs = field.options.split(',').map((item) => {
        const [key, value] = item.trim().split(':');
        return [key.trim(), (value || key).trim()];
      });
      options = Object.fromEntries(keyValuePairs);
    }

    if(typeof options !== 'object') {
      options = { [field.options]: field.options};
    }

    return html`
      <${Select} label=${field.label} prop=${prop} options=${options} />
    `;
  });
};

const getPanels = (panelsData) => {
  return panelsData[':names'].map(panelName => {
    const panelData = panelsData[panelName];
    return {
      title: panelName.charAt(0).toUpperCase() + panelName.slice(1),
      content: html`${getFields(panelData.data)}`,
    };
  });
};

const Configurator = ({ title, panels, lsKey, block }) => {
  const { state } = useContext(ConfiguratorContext);

  useEffect(() => {
    const linkBlock = createTag('a', { class: block, href: getUrl() }, getUrl() );
    const blockEl = document.getElementsByClassName(block)[0];
    blockEl.replaceWith(linkBlock);
    loadBlock(linkBlock);
    saveStateToLocalStorage(state, lsKey);
  }, [state]);

  const getUrl = () => {
    const url = window.location.href.split('#')[0];
    return `${url}#${utf8ToB64(JSON.stringify(stateReform(state)))}`;
  };

  return html`
      <div class="tool-header">
        <div class="tool-title">
          <h1>${title}</h1>
        </div>
        <${CopyBtn} />
      </div>
      <div class="tool-content">
        <div class="config-panel">
          <${Accordion} lskey=${lsKey} items=${panels} alwaysOpen=${false} />
        </div>
        <div class="content-panel">
          <div class="section">
            <a class="${block}" href="${getUrl()}" />
          </div>
        </div>
      </div>`;
};

const ConfiguratorWrapper = ({ block, link }) => {
  const [defaults, setDefaults] = useState([]);
  const [panels, setPanels] = useState([]);
  const blockName = block.toLowerCase()
  const title = `${block} Configurator`;
  const lsKey = `${block.toLowerCase()}ConfiguratorState`;

  useEffect(() => {
    fetchData(link)
      .then((json) => {
        setPanels(getPanels(json));
        setDefaults(getDefaults(json));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return html`
  <${ConfiguratorProvider} defaultState=${defaults} lsKey=${lsKey}>
    <${Configurator} title=${title} panels=${panels} lsKey=${lsKey} block=${blockName} />
  </${ConfiguratorProvider}>
  `;
};

export default async function init(el) {
  loadStyle('/libs/ui/page/page.css');
  const children = Array.from(el.querySelectorAll(':scope > div'));
  const block = children[0].textContent.trim();
  const link = children[1].querySelector('a[href$="json"]').href;

  const app = html`<${ConfiguratorWrapper} block=${block} link=${link} />`;
  render(app, el);
}
