import { createTag } from '../../utils/utils.js';
import { loadTacocat, omitNullValues } from '../merch/merch.js';

const decorateOfferDetails = (el, offer) => {
  const offerDetails = document.createElement('ul');
  offerDetails.className = 'offer-details';

  if (offer !== null && typeof offer === 'object') {
    Object.entries(offer).forEach(([key, value]) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${key}:</strong> ${value}`;
      offerDetails.appendChild(li);
    });
    return offerDetails;
  }
};

const handleSearch = (e) => {
  // const offer = {
  //   type: 'Type 1',
  //   offerID: '123456',
  //   productArrangement: 'Product 1',
  //   pricePoint: 'Price 1',
  //   customerSegment: 'Segment 1',
  //   commitment: 'Commitment 1',
  //   term: 'Term 1',
  //   offerType: 'Type 2',
  //   OSI: 'OSI 1',
  //   price: '$49.99',
  //   checkoutURL: 'https://www.google.com',
  // };
  const search = e.target.value;
  try {
    loadTacocat();
  } catch (error) {
    console.error('Tacocat not loaded', error);
    return undefined;
  }
  const { searchParams } = new URL(search);
  const osi = searchParams.get('osi');
  const type = searchParams.get('type');
  if (!(osi && type)) {
    e.textContent = '';
    e.setAttribute('aria-details', 'Invalid URL');
    console.log('Invalid URL');
    return undefined;
  }
};

const decorateSearch = (el) => {
  const search = createTag('input', { class: 'offer-search', placeholder: 'Search offer', value: 'https://ost--milo--adobecom.hlx.page/tools/ost?osi=Mutn1LYoGojkrcMdCLO7LQlx1FyTHw27ETsfLv0h8DQ&offerId=01A09572A72A7D7F848721DE4D3C73FA&type=price&term=true&seat=true&tax=false' });
  const icon = createTag('div', { class: 'offer-search-icon' });
  const wrapper = createTag('div', { class: 'offer-search-wrapper' }, [search, icon]);

  search.addEventListener('keyup', (e) => { handleSearch(e); });
  el.append(wrapper);
};

function detectContext() {
  if (window.self === window.top) document.body.classList.add('in-page');
}

export default async function init(el) {
  detectContext();
  decorateSearch(el);
}
