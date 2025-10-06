'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */

const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar')
    },
    content: {
        daysConteiner: document.getElementById('days'),
        nextDay: document.querySelector('.habbit__day')
    },
    popup: {
        index:document.getElementById('add-habbit_popup'),
        iconField:document.querySelector('.popup__form input[name="icon"]')
    }
}

/* utils */

function loadData() {
    const habbitString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup() {
    if (page.popup.index.classList.contains('cover_hidden')) {
        page.popup.index.classList.remove('cover_hidden');
    } else {
        page.popup.index.classList.add('cover_hidden');
    }
}

/* render */

const contextMenu = document.createElement('div');
contextMenu.classList.add('context-menu');
const deleteBtn = document.createElement('button');
deleteBtn.textContent = 'Видалити звичку';
contextMenu.appendChild(deleteBtn);
document.body.appendChild(contextMenu);

deleteBtn.addEventListener('click', () => {
    const id = contextMenu.dataset.habbitId;
    if (id) deleteHabbit(Number(id));
    contextMenu.style.display = 'none';
});

document.addEventListener('click', () => contextMenu.style.display = 'none');

function rerenderMenu(activeHabbit) {
    page.menu.innerHTML = '';

    for (const habbit of habbits) {
        const btn = document.createElement('button');
        btn.classList.add('menu__item');
        btn.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}">`;
        if (activeHabbit.id === habbit.id) btn.classList.add('menu__item_active');
        btn.addEventListener('click', () => rerender(habbit.id));

        btn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextMenu.style.top = e.pageY + 'px';
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.display = 'block';
            contextMenu.dataset.habbitId = habbit.id;
        });

        page.menu.appendChild(btn);
    }
}

function rerenderHead(activeHabbit) {
    page.header.h1.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100;
    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`); 
}

function rerenderContent(activeHabbit) {
    page.content.daysConteiner.innerHTML = '';
    for (const index in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
                        <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
                        <button class="habbit__delete">
                            <img src="./images/Delete.svg" alt="Видалити день ${index + 1}">
                        </button>`;
        element.querySelector('.habbit__delete').addEventListener('click', () => deleteDay(index));
        page.content.daysConteiner.appendChild(element);
    }
    page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    if (!activeHabbit) {
        return;
    }
    document.location.replace(document.location.pathname + '#' + activeHabbitId);
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);
}

/* work with days */

function addDays(event) {
    const form = event.target;
    event.preventDefault();
    const data = new FormData(form);
    const comment = data.get('comment');
    form['comment'].classList.remove('error');
    if (!comment) {
        form['comment'].classList.add('error');
        return;
    }
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment }])
            }
        }
        return habbit;
    });
    form['comment'].value = '';
    rerender(globalActiveHabbitId);
    saveData();
}

function deleteDay(index) {
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.filter((_, i) => i !== Number(index))
            }
        }
        return habbit;
    });
    rerender(globalActiveHabbitId);
    saveData();
}

/* working wiht habbits */

function setIcon(context, icon) {
  const iconField = document.querySelector('.popup__form input[name="icon"]');
  if (!iconField) {
    console.error('Поле icon не знайдено!');
    return;
  }

  iconField.value = icon;

  const activeIcon = document.querySelector('.icon.icon_active');
  if (activeIcon) activeIcon.classList.remove('icon_active');

  context.classList.add('icon_active');
}

function addHabbits(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const name = data.get('name');
  const target = Number(data.get('target'));
  const icon = data.get('icon');

if (!name || !target) {
    const errorMessage = form.querySelector('.error-message');
    errorMessage.textContent = 'Заповни всі поля!';
    errorMessage.classList.add('active');

    form.querySelectorAll('input').forEach(input => {
        if (!input.value) {
            input.classList.add('input-error');
        } else {
            input.classList.remove('input-error');
        }
    });

    return;
} else {
    form.querySelector('.error-message').classList.remove('active');
    form.querySelectorAll('input').forEach(input => input.classList.remove('input-error'));
}


  const newHabbit = {
    id: Date.now(),
    name,
    icon,
    target,
    days: []
  };

  habbits.push(newHabbit);
  saveData();
  togglePopup();
  rerender(newHabbit.id);
  form.reset();
  
  document.querySelector('input[name="icon"]').value = 'sport';
  document.querySelectorAll('.icon').forEach(btn => btn.classList.remove('icon_active'));
  document.querySelector('.icon_select .icon').classList.add('icon_active');
}

function deleteHabbit(habbitId) {
 habbits = habbits.filter(habbit => habbit.id !== habbitId);
 saveData();
    
  if (habbits.length > 0) {
        rerender(habbits[0].id);
    } else {
        page.menu.innerHTML = '';
        page.header.h1.innerText = '';
        page.header.progressPercent.innerText = '';
        page.header.progressCoverBar.style.width = '0%';
        page.content.daysConteiner.innerHTML = '';
    }
}


/* init */

(() => {
  loadData();
  const hashId = Number(document.location.hash.replace('#', ''));
  const urlHabbit = habbits.find(habbit => habbit.id == hashId);
  if (urlHabbit) {
    rerender(urlHabbit.id);
  } else {
     rerender(habbits[0].id);
  }
})();