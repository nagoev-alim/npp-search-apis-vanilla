import axios from 'axios';
import { showNotification } from '../modules/showNotification.js';

export default class App {
  constructor(root) {
    // 🚀 Props
    this.root = root;

    // 🚀 Render Skeleton
    this.root.innerHTML = `
      <h3 class='title'>Search APIs</h3>
      <div class='content'>
        <form data-form=''>
          <label>
            <span class='label'></span>
            <input type='text' name='category' placeholder='Enter keywords'>
          </label>
          <button type='submit'>Submit</button>
        </form>
        <div class='result' data-result=''>
          <div class='row'>
            <h3 class='h5'>Total categories: <span data-categories-count=''>0</span></h3>
            <ul class='buttons' data-buttons=''></ul>
          </div>

          <div class='row hide'>
            <h3 class='h5'>List API</h3>
            <ul class='cards' data-cards=''></ul>
          </div>
        </div>
      </div>
    `;

    // 🚀 Query Selectors
    this.DOM = {
      form: document.querySelector('[data-form]'),
      category: {
        count: document.querySelector('[data-categories-count]'),
        list: document.querySelector('[data-buttons]'),
      },
      cards: document.querySelector('[data-cards]'),
      result: document.querySelector('[data-result]'),
    };

    // 🚀 Events Listeners
    this.fetchCategories();
    this.DOM.form.addEventListener('submit', this.onSubmit);
  }

  //===============================================
  // 🚀 Methods
  //===============================================
  /**
   * @function renderCategories - Render categories HTML
   * @param count
   * @param categories
   */
  renderCategories = (count, categories) => {
    this.DOM.category.count.textContent = count;
    this.DOM.category.list.innerHTML = ``;

    for (const category of categories) {
      const li = document.createElement('li');
      li.innerHTML = `<button data-category='${category}'>${category}</button>`;

      const buttons = li.querySelectorAll('[data-category]');

      buttons.forEach(btn => btn.addEventListener('click', ({ target:{ dataset: { category } }}) => {
        document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.fetchCategory(category);
      }));

      this.DOM.category.list.append(li);
    }
  };

  //===============================================
  /**
   * @function onSubmit - Form submit event handler
   * @param event
   * @returns {Promise<void>}
   */
  onSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const category = Object.fromEntries(new FormData(form).entries()).category.trim().toLowerCase();

    if (category.length === 0) {
      showNotification('warning', 'Please fill the field.');
      return;
    }

    try {
      const { data: { count, entries } } = await axios.get(`https://api.publicapis.org/entries?title=${category}`);
      this.renderCards(entries);
    } catch (e) {
      showNotification('danger', 'Something went wrong, open dev console.');
      console.log(e);
    }
  };

  //===============================================
  /**
   * @function renderCards - Render cards HTML
   * @param entries
   */
  renderCards = (entries) => {
    this.DOM.cards.parentElement.classList.remove('hide');

    this.DOM.cards.innerHTML = `
      ${entries.map((entry) => `
        <li>
          <a href='${entry.Link}' target='_blank'>
            ${['API', 'Description', 'Auth', 'Cors', 'Category'].map((i, idx) => `
              <p>
                <span class='h6'>${idx === 0 ? 'Title' : i}:</span>
                <span>${entry[i] === '' ? '-' : entry[i]}</span>
              </p>
            `).join('')}
          </a>
        </li>
      `).join('')}`;
  };

  //===============================================
  /**
   * @function fetchCategories - Fetch categories from API
   * @returns {Promise<void>}
   */
  fetchCategories = async () => {
    try {
      const {
        data: {
          count, categories,
        },
      } = await axios.get('https://api.publicapis.org/categories');

      this.renderCategories(count, categories);
    } catch (e) {
      showNotification('danger', 'Something went wrong, open dev console.');
      console.log(e);
    }
  };

  //===============================================
  /**
   * @function fetchCategory - Fetch single category entries
   * @param category
   * @returns {Promise<void>}
   */
  fetchCategory = async (category) => {
    try {
      const { data: { count, entries } } = await axios.get(`https://api.publicapis.org/entries?category=${category}`);
      this.renderCards(entries);
    } catch (e) {
      showNotification('danger', 'Something went wrong, open dev console.');
      console.log(e);
    }
  };


}
