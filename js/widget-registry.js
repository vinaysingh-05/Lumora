/**
 * Widget Registry
 * Provides component definitions, DOM builders, live lifecycle loops,
 * and data schemas for all 10 widget types.
 */

// Helper to escape untrusted HTML
export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

export const WidgetRegistry = {
  definitions: {
    clock: {
      type: 'clock',
      title: 'Digital Clock',
      defaultWidth: 260,
      defaultHeight: 140,
      minWidth: 180,
      minHeight: 100,
      render(container, config, onChange) {
        container.innerHTML = `
          <div class="widget-clock-display">
            <span class="widget-clock-time">--:--</span>
            <span class="widget-clock-ampm"></span>
            <div class="widget-clock-date">--------</div>
          </div>
        `;
        const timeEl = container.querySelector('.widget-clock-time');
        const ampmEl = container.querySelector('.widget-clock-ampm');
        const dateEl = container.querySelector('.widget-clock-date');

        function update() {
          const now = new Date();
          let hours = now.getHours();
          const mins = String(now.getMinutes()).padStart(2, '0');
          const is12h = config.format12 !== false;
          let ampm = '';

          if (is12h) {
            ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
          }
          timeEl.textContent = `${hours}:${mins}`;
          ampmEl.textContent = ampm;
          dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        }
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
      }
    },

    date: {
      type: 'date',
      title: 'Calendar Card',
      defaultWidth: 160,
      defaultHeight: 140,
      minWidth: 140,
      minHeight: 120,
      render(container) {
        const now = new Date();
        const month = now.toLocaleDateString(undefined, { month: 'short' });
        const day = now.getDate();
        const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });

        container.innerHTML = `
          <div class="widget-date-display">
            <div class="widget-date-month">${escapeHTML(month)}</div>
            <div class="widget-date-day">${escapeHTML(String(day))}</div>
            <div class="widget-date-weekday">${escapeHTML(weekday)}</div>
          </div>
        `;
      }
    },

    shortcuts: {
      type: 'shortcuts',
      title: 'Quick Shortcuts',
      defaultWidth: 280,
      defaultHeight: 180,
      minWidth: 200,
      minHeight: 140,
      render(container, config, onChange) {
        const shortcuts = config.items || [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'YouTube', url: 'https://youtube.com' },
          { name: 'Reddit', url: 'https://reddit.com' },
          { name: 'X / Twitter', url: 'https://x.com' }
        ];

        const grid = document.createElement('div');
        grid.className = 'shortcuts-grid';

        shortcuts.forEach(item => {
          const tile = document.createElement('a');
          tile.href = item.url;
          tile.className = 'shortcut-tile';
          tile.target = '_blank';
          tile.rel = 'noreferrer noopener';
          
          const icon = document.createElement('div');
          icon.className = 'shortcut-icon-box';
          icon.textContent = (item.name[0] || '?').toUpperCase();

          const label = document.createElement('span');
          label.className = 'shortcut-name';
          label.textContent = item.name;

          tile.appendChild(icon);
          tile.appendChild(label);
          grid.appendChild(tile);
        });

        container.appendChild(grid);
      }
    },

    notes: {
      type: 'notes',
      title: 'Quick Notes',
      defaultWidth: 260,
      defaultHeight: 220,
      minWidth: 200,
      minHeight: 140,
      render(container, config, onChange) {
        const textarea = document.createElement('textarea');
        textarea.className = 'notes-textarea';
        textarea.placeholder = 'Type your scratchpad note here...';
        textarea.value = config.text || '';
        
        let debounceTimer;
        textarea.addEventListener('input', () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            config.text = textarea.value;
            onChange(config);
          }, 400);
        });

        container.appendChild(textarea);
      }
    },

    todo: {
      type: 'todo',
      title: 'To-do List',
      defaultWidth: 280,
      defaultHeight: 260,
      minWidth: 220,
      minHeight: 180,
      render(container, config, onChange) {
        config.tasks = config.tasks || [
          { id: 1, text: 'Review project deadlines', done: false },
          { id: 2, text: 'Clean glass workspace setup', done: true }
        ];

        const form = document.createElement('form');
        form.className = 'todo-input-form';
        form.innerHTML = `
          <input type="text" class="text-input" placeholder="Add a new task..." required>
          <button type="submit" class="glass-btn">+</button>
        `;

        const list = document.createElement('ul');
        list.className = 'item-list';

        function renderList() {
          list.innerHTML = '';
          config.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.done ? 'completed' : ''}`;

            const check = document.createElement('input');
            check.type = 'checkbox';
            check.className = 'todo-checkbox';
            check.checked = task.done;
            check.addEventListener('change', () => {
              task.done = check.checked;
              li.classList.toggle('completed', task.done);
              onChange(config);
            });

            const span = document.createElement('span');
            span.className = 'todo-text';
            span.textContent = task.text;

            const del = document.createElement('button');
            del.className = 'todo-delete-btn';
            del.innerHTML = '&times;';
            del.title = 'Remove Task';
            del.addEventListener('click', () => {
              config.tasks = config.tasks.filter(t => t.id !== task.id);
              renderList();
              onChange(config);
            });

            li.appendChild(check);
            li.appendChild(span);
            li.appendChild(del);
            list.appendChild(li);
          });
        }

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = form.querySelector('input');
          const val = input.value.trim();
          if (!val) return;
          config.tasks.push({ id: Date.now(), text: val, done: false });
          input.value = '';
          renderList();
          onChange(config);
        });

        renderList();
        container.appendChild(form);
        container.appendChild(list);
      }
    },

    tabs: {
      type: 'tabs',
      title: 'Active Tabs',
      defaultWidth: 280,
      defaultHeight: 240,
      minWidth: 200,
      minHeight: 160,
      render(container) {
        const list = document.createElement('ul');
        list.className = 'item-list';
        container.appendChild(list);

        function refreshTabs() {
          if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
              list.innerHTML = '';
              tabs.slice(0, 15).forEach(tab => {
                const li = document.createElement('li');
                const btn = document.createElement('button');
                btn.className = 'list-item-btn';
                
                const favicon = document.createElement('img');
                favicon.className = 'list-favicon';
                favicon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="%23888"/></svg>';
                favicon.onerror = () => { favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="%23888"/></svg>'; };

                const title = document.createElement('span');
                title.className = 'list-title';
                title.textContent = tab.title || tab.url;

                const close = document.createElement('button');
                close.className = 'tab-close-btn';
                close.innerHTML = '&times;';
                close.title = 'Close Tab';
                close.addEventListener('click', (e) => {
                  e.stopPropagation();
                  chrome.tabs.remove(tab.id, () => refreshTabs());
                });

                btn.appendChild(favicon);
                btn.appendChild(title);
                btn.appendChild(close);

                btn.addEventListener('click', () => {
                  chrome.tabs.update(tab.id, { active: true });
                });

                li.appendChild(btn);
                list.appendChild(li);
              });
            });
          } else {
            list.innerHTML = `<li style="font-size:12px;color:var(--text-dim);padding:8px;">Tabs API is only available in Chrome Extension environment.</li>`;
          }
        }

        refreshTabs();
      }
    },

    bookmarks: {
      type: 'bookmarks',
      title: 'Bookmarks',
      defaultWidth: 280,
      defaultHeight: 240,
      minWidth: 200,
      minHeight: 160,
      render(container) {
        const list = document.createElement('ul');
        list.className = 'item-list';
        container.appendChild(list);

        if (typeof chrome !== 'undefined' && chrome.bookmarks?.getRecent) {
          chrome.bookmarks.getRecent(12, (bookmarks) => {
            list.innerHTML = '';
            bookmarks.forEach(bm => {
              if (!bm.url) return;
              const li = document.createElement('li');
              const link = document.createElement('a');
              link.className = 'list-item-btn';
              link.href = bm.url;
              link.target = '_blank';
              link.rel = 'noreferrer noopener';

              const title = document.createElement('span');
              title.className = 'list-title';
              title.textContent = bm.title || bm.url;

              link.appendChild(title);
              li.appendChild(link);
              list.appendChild(li);
            });
          });
        } else {
          list.innerHTML = `<li style="font-size:12px;color:var(--text-dim);padding:8px;">Bookmark permission not granted or unavailable.</li>`;
        }
      }
    },

    profile: {
      type: 'profile',
      title: 'Profile Card',
      defaultWidth: 220,
      defaultHeight: 200,
      minWidth: 180,
      minHeight: 160,
      render(container, config, onChange) {
        const name = config.name || 'Workspace User';
        const status = config.status || 'Focusing on deep work';
        const avatar = config.avatarUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%234B5563"/><path d="M20 20a7 7 0 100-14 7 7 0 000 14zm0 4c-6.67 0-14 3.34-14 8v2h28v-2c0-4.66-7.33-8-14-8z" fill="%23FFF"/></svg>';

        container.innerHTML = `
          <div class="profile-content">
            <img class="profile-avatar" src="${escapeHTML(avatar)}" alt="Avatar">
            <div class="profile-name">${escapeHTML(name)}</div>
            <div class="profile-status">${escapeHTML(status)}</div>
          </div>
        `;
      }
    },

    customText: {
      type: 'customText',
      title: 'Custom Text / Quote',
      defaultWidth: 260,
      defaultHeight: 160,
      minWidth: 180,
      minHeight: 100,
      render(container, config, onChange) {
        const text = config.content || '“Simplicity is prerequisite for reliability.”\n— Edsger W. Dijkstra';
        const pre = document.createElement('div');
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.fontSize = '13px';
        pre.style.lineHeight = '1.6';
        pre.style.color = 'var(--text-muted)';
        pre.textContent = text;
        container.appendChild(pre);
      }
    },

    customImage: {
      type: 'customImage',
      title: 'Image Frame',
      defaultWidth: 280,
      defaultHeight: 220,
      minWidth: 180,
      minHeight: 140,
      render(container, config) {
        const img = document.createElement('img');
        img.src = config.src || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231e293b"/><text x="50" y="55" font-size="12" fill="%2394a3b8" text-anchor="middle">Glass Frame</text></svg>';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = 'calc(var(--glass-radius) * 0.5)';
        container.appendChild(img);
      }
    }
  }
};