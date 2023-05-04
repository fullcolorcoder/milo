import { createTag } from '../../utils/utils.js';
import { loadTacocat } from '../merch/merch.js';

const decorateOfferDetails = (el, offer) => {
  const offerDetails = document.createElement('ul', { class: 'offer-details' });
  // const offer = {
  //   'Type': offer.type,
  //   'Offer ID': offer.offerID,
  //   'Product Arrangement': offer.productArrangement,
  //   'Price Point': offer.pricePoint,
  //   'Customer Segment': offer.customerSegment,
  //   'Commitment': offer.commitment,
  //   'Term': offer.term,
  //   'Offer Type': offer.offerType,
  //   'OSI': offer.OSI
  // };
  if (offer !== null && typeof offer === 'object') {
    Object.entries(offer).forEach(([key, value]) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${key}:</strong> ${value}`;
      offerDetails.appendChild(li);
    });
    return offerDetails;
  }
};

const handleSearch = (e, els) => {
  const search = e.target.value;
  loadTacocat();
  const { searchParams } = new URL(e.href);
  const osi = searchParams.get('osi');
  const type = searchParams.get('type');
  if (!(osi && type)) {
    e.textContent = '';
    e.setAttribute('aria-details', 'Invalid URL');
    return undefined;
  }

  els.forEach((subject) => {
    if (subject.textContent.includes(search)) {
      subject.style.display = 'flex';
    } else {
      subject.style.display = 'none';
    }
  });
};

const decorateSearch = (el) => {
  const search = createTag('input', { class: 'offer-search', placeholder: 'Search offer' });
  const icon = createTag('div', { class: 'offer-search-icon' });
  const wrapper = createTag('div', { class: 'offer-search-wrapper' }, [search, icon]);
  const offer = {
    type: 'Type 1',
    offerID: '123456',
    productArrangement: 'Product 1',
    pricePoint: 'Price 1',
    customerSegment: 'Segment 1',
    commitment: 'Commitment 1',
    term: 'Term 1',
    offerType: 'Type 2',
    OSI: 'OSI 1',
    price: '$49.99',
    checkoutURL: 'https://www.google.com',
  };
  const offerDetails = decorateOfferDetails(el, offer);
  search.addEventListener('keyup', (e) => { handleSearch(e, offerDetails); });
  el.append(wrapper, offerDetails);
};

function detectContext() {
  if (window.self === window.top) document.body.classList.add('in-page');
}

export default async function init(el) {
  detectContext();
  decorateSearch(el);
}
