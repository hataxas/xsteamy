const burger = document.querySelector('.sidebar__burger');
const menu = document.querySelector('.sidebar__items');
const body = document.querySelector('body');
const itemsMenu = document.querySelectorAll('.sidebar__item');
const pages = document.querySelectorAll('.pagination__button');

burger.addEventListener('click', function () {
  burger.classList.toggle('active');
  menu.classList.toggle('active');
  // We add this class to make it non-scrollable when the menu is open
  body.classList.toggle('lock');
});

for (let i = 0; i < itemsMenu.length; i++) {
  itemsMenu[i].addEventListener('click', function () {
    for (let j = 0; j < itemsMenu.length; j++) {
      itemsMenu[j].classList.remove('selected');
    }
    this.classList.toggle('selected');
  });
}

for (let i = 0; i < pages.length; i++) {
  pages[i].addEventListener('click', function () {
    for (let j = 0; j < pages.length; j++) {
      pages[j].classList.remove('selected');
    }
    this.classList.toggle('selected');
  });
}

feather.replace();
