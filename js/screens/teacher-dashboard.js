/* =========================================================================
   LIZKIDS — PAINEL DA PROFESSORA
   ========================================================================= */

import { el, formatTime } from '../core/utils.js';
import { Router }   from '../core/router.js';
import { Storage }  from '../core/storage.js';
import { Audio }    from '../core/audio.js';
import { GAMES }    from '../data/games-catalog.js';
import { CHARACTERS, ICONS } from '../data/characters.js';

export const TeacherScreen = {
  mount () {
    const wrap = el('div', { class: 'liz-teacher' });
    const inner = el('div', { class: 'liz-teacher__inner' });

    // Header
    const header = el('div', { class: 'liz-teacher__header' }, [
      el('div', {}, [
        el('h1', { class: 'liz-teacher__title' }, ['Painel da Professora']),
        el('p',  { class: 'liz-teacher__subtitle' }, ['Acompanhe o progresso e o engajamento dos seus alunos']),
      ]),
      el('button', {
        class: 'liz-back',
        onClick: () => { Audio.click(); Router.navigate('profile-select'); },
      }, [el('span', { html: ICONS.back() }), 'Voltar']),
    ]);
    inner.appendChild(header);

    // Estatísticas agregadas
    const profiles = Storage.data.profiles;
    const totalActivities = profiles.reduce((s, p) => s + (p.activityLog?.length || 0), 0);
    const totalStars = profiles.reduce((s, p) => s + p.stars, 0);
    const totalTime  = profiles.reduce((s, p) => s + (p.timeSpentSec || 0), 0);
    const avgLevel   = profiles.length ? Math.round(profiles.reduce((s, p) => s + p.level, 0) / profiles.length) : 0;

    const stats = el('div', { class: 'liz-stats-row' }, [
      makeStatCard({ icon: ICONS.user(),  bg: '#4F7CFF', value: profiles.length,  label: 'Alunos cadastrados' }),
      makeStatCard({ icon: ICONS.star(),  bg: '#FFD23F', value: totalStars,       label: 'Estrelas conquistadas' }),
      makeStatCard({ icon: ICONS.flame(), bg: '#FF7BB5', value: 'Nv ' + avgLevel, label: 'Nível médio da turma' }),
      makeStatCard({ icon: ICONS.clock(), bg: '#5BE0A3', value: formatTime(totalTime), label: 'Tempo total de uso' }),
    ]);
    inner.appendChild(stats);

    // Grid principal: alunos + gráfico
    const grid = el('div', { class: 'liz-teacher__grid' });

    // Painel de alunos
    const studentsPanel = el('div', { class: 'liz-panel' }, [
      el('h2', { class: 'liz-panel__title' }, [el('span', { html: ICONS.user() }), 'Alunos da Turma']),
    ]);

    if (profiles.length === 0) {
      studentsPanel.appendChild(el('p', { style: { color: 'var(--ink-soft)', textAlign: 'center', padding: '32px 0' } },
        ['Nenhum aluno cadastrado ainda.']));
    } else {
      profiles
        .slice()
        .sort((a, b) => b.level - a.level)
        .forEach(p => {
          const xpPct = (p.xp / (p.level * 100)) * 100;
          const row = el('div', { class: 'liz-student-row' }, [
            el('div', { class: 'liz-student-row__avatar', html: CHARACTERS[p.avatarId]?.() || CHARACTERS.lumi() }),
            el('div', { class: 'liz-student-row__info' }, [
              el('div', { class: 'liz-student-row__name' }, [p.name]),
              el('div', { class: 'liz-student-row__progress' }, [
                el('span', { class: 't-caption' }, ['Nv ' + p.level]),
                el('div', { class: 'liz-progress' }, [
                  el('div', { class: 'liz-progress__fill', style: { width: xpPct + '%' } }),
                ]),
                el('span', { class: 't-caption' }, [Math.round(xpPct) + '%']),
              ]),
            ]),
            el('div', { class: 'liz-student-row__stats' }, [
              el('div', { class: 'liz-pill liz-pill--stars' }, [el('span', { html: ICONS.star() }), String(p.stars)]),
              el('div', { class: 'liz-pill liz-pill--coins' }, [el('span', { html: ICONS.coin() }), String(p.coins)]),
            ]),
            el('div', { class: 't-caption', style: { textAlign: 'right' } }, [
              el('div', {}, [formatTime(p.timeSpentSec || 0)]),
              el('div', { style: { fontSize: '10px', color: 'var(--ink-mute)' } }, [Object.keys(p.gameProgress).length + ' jogos']),
            ]),
          ]);
          studentsPanel.appendChild(row);
        });
    }
    grid.appendChild(studentsPanel);

    // Gráfico: estrelas por jogo
    const chartPanel = el('div', { class: 'liz-panel' }, [
      el('h2', { class: 'liz-panel__title' }, [el('span', { html: ICONS.chart() }), 'Estrelas por Jogo']),
    ]);

    // Acumular estrelas por jogo
    const gameStats = {};
    profiles.forEach(p => {
      Object.entries(p.gameProgress).forEach(([gid, data]) => {
        gameStats[gid] = (gameStats[gid] || 0) + (data.stars || 0);
      });
    });

    const top5 = GAMES
      .map(g => ({ ...g, totalStars: gameStats[g.id] || 0 }))
      .sort((a, b) => b.totalStars - a.totalStars)
      .slice(0, 6);

    const max = Math.max(...top5.map(g => g.totalStars), 1);

    const chart = el('div', { class: 'liz-bar-chart' });
    top5.forEach((g, i) => {
      const h = Math.max(8, (g.totalStars / max) * 180);
      chart.appendChild(el('div', {
        class: 'liz-bar',
        style: { height: h + 'px', background: g.grad, animationDelay: (i * 60) + 'ms' },
      }, [
        el('span', { class: 'liz-bar__value' }, [String(g.totalStars)]),
        el('span', { class: 'liz-bar__label' }, [g.title.split(' ')[0]]),
      ]));
    });

    chartPanel.appendChild(chart);
    chartPanel.appendChild(el('div', { style: { height: '28px' } }));

    // Atividades recentes
    chartPanel.appendChild(el('h3', {
      class: 't-eyebrow', style: { marginTop: '16px', marginBottom: '12px', color: 'var(--ink-soft)' }
    }, ['Atividade Recente']));

    const allActivities = profiles
      .flatMap(p => (p.activityLog || []).map(a => ({ ...a, profileName: p.name, avatarId: p.avatarId })))
      .sort((a, b) => b.at - a.at)
      .slice(0, 5);

    if (!allActivities.length) {
      chartPanel.appendChild(el('p', { style: { color: 'var(--ink-mute)', fontWeight: 700 } }, ['Sem atividades ainda.']));
    } else {
      allActivities.forEach(act => {
        const g = GAMES.find(gm => gm.id === act.gameId);
        const item = el('div', {
          style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderTop: '1px solid rgba(46,34,87,0.08)' }
        }, [
          el('div', { style: { width: '36px', height: '36px', borderRadius: '12px', background: 'var(--liz-lilac-soft)', overflow: 'hidden', flexShrink: 0 }, html: CHARACTERS[act.avatarId]?.() || '' }),
          el('div', { style: { flex: 1, minWidth: 0 } }, [
            el('div', { style: { fontWeight: 800, color: 'var(--ink)', fontSize: 'var(--fs-sm)' } }, [
              act.profileName + ' jogou ' + (g?.title || act.gameId),
            ]),
            el('div', { class: 't-caption' }, [timeAgo(act.at)]),
          ]),
          el('div', { class: 'liz-pill liz-pill--stars' }, [
            el('span', { html: ICONS.star() }), String(act.stars || 0),
          ]),
        ]);
        chartPanel.appendChild(item);
      });
    }

    grid.appendChild(chartPanel);
    inner.appendChild(grid);

    wrap.appendChild(inner);
    return wrap;
  },
  unmount () {},
};

function makeStatCard ({ icon, bg, value, label }) {
  return el('div', { class: 'liz-stat-card' }, [
    el('div', { class: 'liz-stat-card__icon', style: { background: bg }, html: icon }),
    el('div', { class: 'liz-stat-card__value' }, [String(value)]),
    el('div', { class: 'liz-stat-card__label' }, [label]),
  ]);
}

function timeAgo (ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'agora há pouco';
  if (s < 3600) return Math.floor(s / 60) + ' min atrás';
  if (s < 86400) return Math.floor(s / 3600) + ' h atrás';
  return Math.floor(s / 86400) + ' dias atrás';
}
