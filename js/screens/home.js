
import { el } from '../core/utils.js';
import { Router } from '../core/router.js';
import { Storage } from '../core/storage.js';

export const HomeScreen = {
  mount() {
    const profile = Storage.getActiveProfile?.() || { name: 'Aluno' };

    const wrap = document.createElement('div');
    wrap.style.minHeight = '100vh';
    wrap.style.background = 'linear-gradient(180deg,#2E2257,#4b2d7f)';
    wrap.style.color = '#fff';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';
    wrap.style.gap = '20px';
    wrap.style.fontFamily = 'sans-serif';

    const title = document.createElement('h1');
    title.textContent = 'Bem-vindo, ' + profile.name + '!';
    title.style.fontSize = '42px';

    const sub = document.createElement('p');
    sub.textContent = 'Home carregada com sucesso';
    sub.style.opacity = '0.9';

    const btn = document.createElement('button');
    btn.textContent = 'Abrir Jogos';
    btn.style.padding = '14px 24px';
    btn.style.borderRadius = '14px';
    btn.style.border = 'none';
    btn.style.fontSize = '18px';
    btn.style.cursor = 'pointer';

    btn.onclick = () => {
      try {
        Router.navigate('library');
      } catch(e) {
        alert('Biblioteca ainda não carregada');
      }
    };

    wrap.appendChild(title);
    wrap.appendChild(sub);
    wrap.appendChild(btn);

    return wrap;
  }
};
