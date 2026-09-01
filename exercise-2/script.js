(function () {
  const form = document.getElementById('formPages');

  function syncVisual(input) {
    const box = input.nextElementSibling;
    if (!box || !box.classList.contains('fake-box')) return;
    box.setAttribute('aria-checked', input.checked ? 'true' : 'false');
  }

  form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    syncVisual(input);
    input.addEventListener('change', () => {
      const group = input.closest('[data-group]')?.dataset.group;
      if (group && input.checked) {
        form.querySelectorAll(`[data-group="${CSS.escape(group)}"] input[type="checkbox"]`).forEach((other) => {
          if (other !== input) other.checked = false;
          syncVisual(other);
        });
      }
      syncVisual(input);
    });
  });

  document.getElementById('printBtn').addEventListener('click', () => window.print());

  document.getElementById('resetBtn').addEventListener('click', () => {
    form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = false;
      syncVisual(input);
    });
    // Match the supplied PDF's initially checked boxes again.
    ['input[name="return-work"][value="returned"]',
     'input[name="working"][value="modified-reduced"]',
     'input[name="recovery"][value="recovered"]',
     '.page-3 .cert-row input'].forEach((selector) => {
      form.querySelectorAll(selector).forEach((input) => {
        input.checked = true;
        syncVisual(input);
      });
    });
  });
})();
