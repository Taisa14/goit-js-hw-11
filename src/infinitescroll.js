import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import apiService from './fetctSubmit.js';

const form = document.querySelector('.search-form');
const listPhoto = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');

const options = {
    root: null,
    rootMargin: '200px',
    treshhold: 1.0,
};
const observer = new IntersectionObserver(onLoad, options);

form.addEventListener('submit', onSearch);

let counter = 40;

function onLoad(entries, observer) {
    console.log(entries);
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            ApiService.getRequest().then(data => {
                createMarkupGallery(data);
                counter += data.hits.length;
                if (counter >= data.totalHits) {
                    observer.unobserve(guard);
                    return Notify.failure("We're sorry, but you've reached the end of search results.");
                }
            });
        }
    });
}

const ApiService = new apiService();

function onClear() {
    listPhoto.innerHTML = '';
}

function onSearch(evn) {
    evn.preventDefault();

    ApiService.searchQuery = evn.currentTarget.elements.searchQuery.value;
    console.log(ApiService.searchQuery);
    if (ApiService.searchQuery === '') {
        onClear();
        return Notify.failure('Sorry, there are no images matching your search query. Please enter something!');
    }
    ApiService.resetPage();
    ApiService.getRequest().then(data => {
        console.log(data);
        onClear();
        createMarkupGallery(data);
        observer.observe(guard);
    });
}

function createMarkupGallery(data) {
    const markupGallery = data.hits.map(({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
    }) => `<div class="photo-card">
     <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" class="picture" /></a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b> ${likes}
        </p>
        <p class="info-item">
          <b>Views</b> ${views}
        </p>
        <p class="info-item">
          <b>Comments</b> ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b> ${downloads}
        </p>
      </div>
    </div>`
    ).join('');

    listPhoto.insertAdjacentHTML('beforeend', markupGallery);

    smoothScroll();

    new SimpleLightbox('.gallery a', {
        captionPosition: 'bottom',
        captionsData: 'alt',
        captionDelay: 250,
    }).refresh();
}

function smoothScroll() {
    const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
    });
}