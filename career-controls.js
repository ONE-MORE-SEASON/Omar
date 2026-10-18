/* ONE MORE SEASON — redundant Player Calendar cleanup
   The main page already has the working Season Calendar. The older
   PLAYER CALENDAR panel is intentionally removed to avoid duplicate controls.
*/
(() => {
  'use strict';
  function removeRedundantPlayerCalendar(){
    document.querySelectorAll('#home .panel').forEach(panel => {
      const heading = panel.querySelector('h2');
      if (heading && heading.textContent.trim().toUpperCase() === 'PLAYER CALENDAR') {
        panel.remove();
      }
    });
  }
  function boot(){
    removeRedundantPlayerCalendar();
    // Run once more after the main career UI finishes rendering.
    setTimeout(removeRedundantPlayerCalendar, 150);
    setTimeout(removeRedundantPlayerCalendar, 600);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
