const form = document.getElementById('idea-form');
const rows = document.getElementById('idea-rows');
const errorEl = document.getElementById('error');

async function fetchIdeas() {
  try {
    const res = await fetch('/api/ideas');
    const data = await res.json();
    renderRows(data);
  } catch (error) {
    errorEl.textContent = 'No se pudieron cargar las ideas.';
    console.error(error);
  }
}

function renderRows(ideas) {
  if (!ideas.length) {
    rows.innerHTML = `<tr><td class="empty" colspan="6">Aún no hay ideas guardadas.</td></tr>`;
    return;
  }

  rows.innerHTML = ideas
    .map(
      (idea) => `
        <tr>
          <td>${idea.name}</td>
          <td>${idea.reach}</td>
          <td>${idea.impact}</td>
          <td>${Math.round(idea.confidence * 100)}%</td>
          <td>${idea.effort}</td>
          <td class="score">${idea.score}</td>
        </tr>
      `
    )
    .join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.json();
      errorEl.textContent = body.error || 'Error al guardar la idea.';
      return;
    }

    form.reset();
    await fetchIdeas();
  } catch (error) {
    errorEl.textContent = 'No se pudo guardar la idea.';
    console.error(error);
  }
});

fetchIdeas();
