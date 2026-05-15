/* =========================================================================
   LIZKIDS — SELEÇÃO DE PERFIS (estilo Netflix/Disney+)
   ========================================================================= */

import { el }       from '../core/utils.js';
import { Router }   from '../core/router.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { State, Bus } from '../core/state.js';
import { Debug }    from '../core/error-overlay.js';
import { CHARACTERS, ICONS } from '../data/characters.js';
import { SkyStage } from '../components/ui.js';

const SELECTABLE_AVATARS = ['lumi','bobo','pip','mel','drako','owly','zap','robo'];

export const ProfileSelectScreen = {
  mount () {
    Debug.log('ProfileSelect', `mount() — ${Storage.data.profiles.length} perfis cadastrados`);
    const wrap = el('div');
    wrap.appendChild(SkyStage('night'));

    const stage = el('div', { class: 'liz-profiles' });

    stage.appendChild(el('h1', { class: 'liz-profiles__title' }, ['Quem está aí?']));
    stage.appendChild(el('p', { class: 'liz-profiles__subtitle' }, ['Escolha seu perfil para começar a aventura']));

    const grid = el('div', { class: 'liz-profiles__grid' });

    const profiles = Storage.data.profiles;
    profiles.forEach((p, i) => {
      const card = el('div', {
        class: 'liz-profile-card',
        style: { animationDelay: (i * 80) + 'ms' },
      });

      const avatar = el('div', { class: 'liz-profile-card__avatar', html: CHARACTERS[p.avatarId]?.() || CHARACTERS.lumi() });
      const name = el('div', { class: 'liz-profile-card__name' }, [p.name]);
      const lvl = el('div', { class: 'liz-profile-card__level' }, ['Nível ' + p.level]);

      const del = el('button', {
        class: 'liz-profile-card__delete',
        html: ICONS.trash(),
        onClick: (e) => {
          e.stopPropagation();
          if (confirm(`Excluir o perfil de ${p.name}? Esta ação não pode ser desfeita.`)) {
            Storage.deleteProfile(p.id);
            Audio.pop();
            Router.navigate('profile-select');
          }
        },
      });

      card.appendChild(avatar);
      card.appendChild(name);
      card.appendChild(lvl);
      card.appendChild(del);

      card.addEventListener('click', () => {
        Audio.click();
        Storage.setActiveProfile(p.id);
        State.setProfile(p);
        Router.navigate('home');
      });

      grid.appendChild(card);
    });

    // Card adicionar
    const addCard = el('div', {
      class: 'liz-profile-card liz-profile-card--add',
      style: { animationDelay: (profiles.length * 80) + 'ms' },
      onClick: () => { Audio.click(); openCreateModal(); },
    }, [
      el('div', { class: 'liz-profile-card__avatar', html: ICONS.plus() }),
      el('div', { class: 'liz-profile-card__name' }, ['Adicionar']),
      el('div', { class: 'liz-profile-card__level' }, ['Novo aluno']),
    ]);
    grid.appendChild(addCard);

    stage.appendChild(grid);

    // Botão da professora
    const teacherBtn = el('button', {
      class: 'liz-profiles__teacher',
      onClick: () => { Audio.click(); Router.navigate('teacher'); },
    }, [
      el('div', { class: 'liz-profiles__teacher-avatar', html: ICONS.chart() }),
      'Área da Professora',
    ]);
    stage.appendChild(teacherBtn);

    wrap.appendChild(stage);
    return wrap;
  },
  unmount () { Debug.log('ProfileSelect', 'unmount()'); },
};

function openCreateModal () {
  let selectedAvatar = 'lumi';

  const avatarPicker = el('div', { class: 'liz-avatar-picker' });
  SELECTABLE_AVATARS.forEach(id => {
    const pick = el('button', {
      class: 'liz-avatar-pick' + (id === selectedAvatar ? ' liz-avatar-pick--selected' : ''),
      html: CHARACTERS[id](),
      onClick: () => {
        Audio.click();
        selectedAvatar = id;
        avatarPicker.querySelectorAll('.liz-avatar-pick').forEach(b => b.classList.remove('liz-avatar-pick--selected'));
        pick.classList.add('liz-avatar-pick--selected');
      },
    });
    avatarPicker.appendChild(pick);
  });

  const nameInput = el('input', {
    class: 'liz-input',
    type: 'text',
    placeholder: 'Como você se chama?',
    maxlength: 20,
  });
  const ageInput = el('input', {
    class: 'liz-input',
    type: 'number',
    placeholder: 'Sua idade',
    min: 3, max: 12, value: 6,
  });

  const panel = el('div', { class: 'liz-modal__panel liz-create-profile' }, [
    el('h2', { class: 'liz-create-profile__title' }, ['Criar Novo Perfil']),
    el('p',  { class: 'liz-create-profile__subtitle' }, ['Escolha um nome e o personagem favorito']),
    nameInput,
    ageInput,
    el('p', { class: 't-eyebrow', style: { textAlign: 'center', margin: '8px 0 12px' } }, ['Seu personagem']),
    avatarPicker,
    el('div', { class: 'liz-form-row' }, [
      el('button', {
        class: 'liz-btn liz-btn--sm',
        style: { background: '#A89EC4', boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.15), 0 6px 0 rgba(60,40,90,0.4)' },
        onClick: () => { Audio.click(); modal.remove(); },
      }, ['Cancelar']),
      el('button', {
        class: 'liz-btn liz-btn--green liz-btn--sm',
        onClick: () => {
          const name = (nameInput.value || '').trim();
          if (!name) { Debug.warn('ProfileSelect', 'Nome vazio — bloqueando'); nameInput.focus(); return; }
          Debug.log('ProfileSelect', `Criando perfil: name="${name}" avatar="${selectedAvatar}" age=${ageInput.value}`);
          Audio.coin();
          const profile = Storage.createProfile({ name, avatarId: selectedAvatar, age: Number(ageInput.value) || 6 });
          Debug.log('ProfileSelect', `Perfil criado: id=${profile.id}, navegando para home…`);
          State.setProfile(profile);
          modal.remove();
          Router.navigate('home');
        },
      }, ['Criar Perfil']),
    ]),
  ]);

  const modal = el('div', { class: 'liz-modal' }, [panel]);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  setTimeout(() => nameInput.focus(), 100);
}
