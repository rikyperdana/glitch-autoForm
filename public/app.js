var m, _, autoForm;
m.mount(document.body, {view: function(){
  return m('.container', m(autoForm({
    id: 'insertContact',
    action: console.log,
    schema: {
      name: {type: String},
      age: {type: Number, minMax: function(){return [18, 65]}},
      birth: {type: Date},
      address: {type: String, label: 'Home Adress'},
      mobile: {type: Number, optional: true},
    },
    submit: {value: 'Save', class: 'is-info'},
    autoReset: true
  })))
}});
