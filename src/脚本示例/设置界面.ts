import 界面 from './设置界面.vue';

const app = createApp(界面).use(createPinia());

$(() => {
  const $app = create_script_id_div();
  $('#extensions_settings2').append($app);
  teleport_style();
  app.mount($app[0]);
});

$(window).on('unload', () => {
  app.unmount();
  deteleport_style();
  destroy_script_id_div();
});

function teleport_style() {
  if ($(`head > div[script_id="${getScriptId()}"]`).length > 0) {
    return;
  }
  const $div = $(`<div>`).attr('script_id', getScriptId()).append($(`head > style`, document).clone());
  $('head').append($div);
}

function deteleport_style() {
  $(`head > div[script_id="${getScriptId()}"]`).remove();
}

function create_script_id_div(): JQuery<HTMLDivElement> {
  return $('<div>').attr('script_id', getScriptId()) as JQuery<HTMLDivElement>;
}

function destroy_script_id_div(): void {
  $(`div[script_id="${getScriptId()}"]`).remove();
}
