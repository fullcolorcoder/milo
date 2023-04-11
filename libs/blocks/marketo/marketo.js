/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
 * Marketo Form
 */
import { parseEncodedConfig, loadScript, createTag } from '../../utils/utils.js';

const DESTINATION_URL = 'destination url';
const HIDDEN_FIELDS = 'hidden fields';
const BASE_URL = 'base url';
const FORM_ID = 'form id';
const MUNCHKIN_ID = 'munchkin id';
const ERROR_MESSAGE = 'error message';

export const initMczDataLayer = () => {
  window.mcz_marketoForm_pref = window.mcz_marketoForm_pref || {
    profile: {
      //Profile Settings
      prefLanguage: "", //Preferred Language from browser
      segLangCode: "", //Markto Segmentation Language
      known_visitor: "X", //X,A,B,C - known visitor level
    },
    form: {
      //form settings
      type: "marketo_form", //This is a Marketo Form default value
      subType: "seminar", //seminar, whitepaper_form, nurture, webinar, strategy_webinar, demo, etc
      sucess: {
        //success handling
        type: "redirect", //redirect, msg, none
        content: "https://www.adobe.com/redirect", //redirect url, message, none
        delay: 5000, //delay in ms to wait for Marketo before fallback redirect
        confirm: false, //true,false - form is is ready for redirect
      },
      version: "1.0.0", //version of the form from Marketo
    },
    program: {
      //Marketo Program Settings
      additional_form_id: "", //Additional Form ID to pull values from
      poi: "", //MARKETOENGAGEMENTPLATFORM - hardcoded product poi will be hidden
      coPartnerNames: "Partner1", //Partner1, Partner2
      campaignIds: {
        //Campaign IDs
        sfdc: "7011212715TT41tEsT", //Salesforce Campaign ID
        external: "7011212721TT41tEsT", //External Campaign ID
        retouch: "a3Fa212725TT41tEsT", //Retouch Campaign ID
        onsite: "a3Fa212731TT41tEsT", //Onsite Campaign ID
        cgen: "ABBB", //CGEN ID
        cuid: "ABBB", //CUID ID
      },
      content: {
        //Content Definition
        type: "pdf", //pdf, video, audio, none
        content_id: "123456", //pdf id, video id, none
      },
    },
    field_visibility: {
      //These fields will be hidden or visible
      phone: "required", //visible, hidden, required
      comments: "visible", //visible, hidden
      demo: "visible", //visible, hidden
    },
    field_filters: {
      //These fields will be hidden or visible with specific values
      products: "POI-Dxonly", //POI-Dxonly, hidden, all
      job_role: "Job Role-HiLevel", //Job Role-HiLevel, hidden, all
      industry: "Industry-Manufacturing", //Industry-Manufacturing, hidden, all
      functional_area: "", //Functional Area-DX, hidden, all
    },
  };
}

const mcz_marketoForm_pref_keys = {
  'form channel': 'form.subType',
  'hardcoded poi': 'program.poi',
  'co-partner names': 'program.coPartnerNames',
  'campaign id - sfdc': 'program.campaignIds.sfdc',
  'campaign id - external': 'program.campaignIds.external',
  'campaign id - retouch': 'program.campaignIds.retouch',
  'campaign id - onsite': 'program.campaignIds.onsite',
  'field - phone': 'field_visibility.phone',
  'field - comments': 'field_visibility.comments',
  'field - demo ': 'field_visibility.demo',
  'filter - products': 'field_filters.products',
  'filter - job role': 'field_filters.job_role',
  'filter - industry': 'field_filters.industry',
  'filter - functional area': 'field_filters.functional_area',
};

const set_inDL = (key, value) => {
  const dataLayerLocation = mcz_marketoForm_pref_keys[key];
  if (dataLayerLocation) {
    const path = dataLayerLocation.split('.');
    path.reduce(function (prev, curr, index, array) {
      if (index === array.length - 1) {
        prev[curr] = value;
      }
      return prev ? prev[curr] : undefined;
    }, window.mcz_marketoForm_pref || self.mcz_marketoForm_pref);
  } else {
    console.log('key not found: ', key, mcz_marketoForm_pref_keys[key]);
  }
}

const loadForm = (form, formData) => {
  if (!form) return;

  if (formData[HIDDEN_FIELDS]) {
    const hiddenFields = {};
    formData[HIDDEN_FIELDS].split(',').forEach((field) => {
      const [key, value] = field.trim().split('=');
      hiddenFields[key] = value;
    });
    form.addHiddenFields(hiddenFields);
  }
};

export const formValidate = (form, success, error, errorMessage) => {
  const formEl = form.getFormElem().get(0);
  formEl.classList.remove('hide-errors');
  formEl.classList.add('show-warnings');

  if (!success && errorMessage) {
    error.textContent = errorMessage;
    error.classList.add('alert');
  } else {
    error.textContent = '';
    error.classList.remove('alert');
  }
};

export const formSuccess = (form, redirectUrl) => {
  const formEl = form.getFormElem().get(0);
  const parentModal = formEl.closest('.dialog-modal');
  const mktoSubmit = new Event('mktoSubmit');

  window.dispatchEvent(mktoSubmit);
  window.mktoSubmitted = true;

  /* c8 ignore next 5 */
  if (parentModal && !redirectUrl) {
    const closeButton = parentModal.querySelector('.dialog-close');
    closeButton.click();
    return false;
  }
  /* c8 ignore next 4 */
  if (redirectUrl) {
    window.location.href = redirectUrl;
    return false;
  }

  return true;
};

const readyForm = (error, form, formData) => {
  const formEl = form.getFormElem().get(0);
  const redirectUrl = formData[DESTINATION_URL];
  const errorMessage = formData[ERROR_MESSAGE];

  formEl.addEventListener(
    'focus',
    (e) => {
      if (e.target.type === 'submit') return;
      const pageTop = document.querySelector('header')?.offsetHeight ?? 0;
      const targetPosition = e.target?.getBoundingClientRect().top ?? 0;
      const offsetPosition = targetPosition + window.pageYOffset - pageTop - window.innerHeight / 2;
      window.scrollTo(0, offsetPosition);
    },
    true
  );
  form.onValidate((success) => formValidate(form, success, error, errorMessage));
  form.onSuccess(() => formSuccess(form, redirectUrl));
};

// init from table block
const init = (el) => {
  console.log(el);
  let formData = {};
  if(el.href) {
    const encodedConfig = el.href.split('#')[1];

    formData = parseEncodedConfig(encodedConfig);
    const form = createTag('div');
    el.replaceWith(form);
    el = form;
  } else {
    const children = Array.from(el.querySelectorAll(':scope > div'));

    children.forEach((element) => {
      const key = element.children[0]?.textContent.toLowerCase();
      const value = element.children[1]?.textContent;
      if (key && value) {
        formData[key] = value;
      }
    });
    formData['style customTheme'] = el.classList;
  }
  

  initMczDataLayer();
  loadMarketoForm(el, formData);
}

// init from configurator or continued from table block
export const loadMarketoForm = (el, config) => {
  if(!el) return;
  console.log('config', config);
  // TODO: refactor, supporting two formats and no error messages
  for (const [key, value] of Object.entries(mcz_marketoForm_pref_keys)) {
    if (config[key])
      set_inDL(key, config[key]);
    if (config[value])
      set_inDL(key, config[value]);
  };
  console.log('mcz_marketoForm_pref', window.mcz_marketoForm_pref);

  const formID = config[FORM_ID];
  const baseURL = config[BASE_URL];
  const munchkinID = config[MUNCHKIN_ID];

  if (!formID || !baseURL) {
    el.style.display = 'none';
    return;
  }

  // TODO: Simplify
  const backgroundTheme = config['style backgroundTheme'] || '';
  const layout = config['style layout'] || '';
  const customTheme = config['style customTheme'] || '';
  const styles = [backgroundTheme, layout, customTheme]
  // reset styles
  el.className = 'marketo';
  styles.filter(Boolean).forEach(style => { el.classList.add(style) });

  let marketoForm = el.querySelector('.mktoForm');

  const fragment = new DocumentFragment();
  const error = createTag('p', { class: 'marketo-error', 'aria-live': 'polite' });
  const span1 = createTag('span', { id: 'mktoForms2BaseStyle', style: 'display:none;' });
  const span2 = createTag('span', { id: 'mktoForms2ThemeStyle', style: 'display:none;' });
  
  const formWrapper = createTag('section', { class: 'marketo-form-wrapper' });
  formWrapper.append(span1, span2);

  if (config.title) {
    const title = createTag('h3', { class: 'marketo-title' }, config.title);
    formWrapper.append(title);
  }
  if (config.description) {
    const description = createTag('p', { class: 'marketo-description' }, config.description);
    formWrapper.append(description);
  }

  
  if (!marketoForm || marketoForm.id != `mktoForm_${formID}`) {
    marketoForm = createTag('form', { ID: `mktoForm_${formID}`, class: 'hide-errors', style: 'opacity:0; visibility:hidden' });

    loadScript(`https:${baseURL}/js/forms2/js/forms2.min.js`)
      .then(() => {
        const { MktoForms2 } = window;
        if (!MktoForms2) throw new Error('Marketo forms not loaded');

        MktoForms2.loadForm(baseURL, munchkinID, formID, (form) => {
          loadForm(form, config);
        });

        MktoForms2.whenReady((form) => {
          readyForm(error, form, config);
        });
      })
      .catch(() => {
        /* c8 ignore next */
        el.style.display = 'none';
      });
  }
  
  formWrapper.append(marketoForm);
  fragment.append(error, formWrapper);
  el.replaceChildren(fragment);
  console.log(marketoForm);
};

export default init;
