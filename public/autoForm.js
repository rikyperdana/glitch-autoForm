var m, _, afState = {arrLen: {}, form: {}};

function autoForm(opts){return {view: function(){
  function normal(name){return name.replace(/\d/g, '$')};
  
  var attr = {
    form: {
      id: opts.id,
      onchange: function(e){
        e.redraw = false;
        if(!afState.form[opts.id]){afState.form[opts.id] = {}};
        afState.form[opts.id][e.target.name] = e.target.value
      },
      onsubmit: function(e){e.preventDefault(); opts.action(
        _.filter(e.target, function(i){
          return i.name && i.value
        }).map(function(obj){if(obj.name && obj.value){
          return _.reduceRight(
            obj.name.split('.'),
            function(res, inc){return _.fromPairs([[inc, res]])},
            function(){if(obj.value){
              var type = opts.schema[normal(obj.name)].type;
              return [ // value conversion
                ((type === String) && obj.value),
                ((type === Number) && +(obj.value)),
                ((type === Date) && Date(obj.value))
              ].filter(function(i){return !!i})[0]
            }}()
          )
        }}).reduce(function(res, inc){
          return _.merge(res, inc)
        }, {})
      ); if(opts.autoReset){afState.form[opts.id] = null}}
    },
    arrLen: function(name, type){return {onclick: function(){
      if(!afState.arrLen[name]){afState.arrLen[name] = 0};
      afState.arrLen[name] += ({inc: 1, dec: -1})[type];
    }}},
    label: function(name, schema){return m('label.label',
      m('span', schema.label || _.startCase(name)),
      m('span', m('b.has-text-danger', !schema.optional && ' *'))
    )}
  };
  
  function inputTypes(name, schema){return {
    hidden: function(){return m('input.input', {
      type: 'hidden', name: !schema.exclude ? name : '',
      value: schema.autoValue(name, afState.form[opts.id])
    })},
    readonly: function(){return m('.field',
      attr.label(name, schema),
      m('input.input', {
        readonly: true, name: !schema.exclude ? name : '',
        value: schema.autoValue(name, afState.form[opts.id])
      })
    )},
    textarea: function(){return m('.field',
      attr.label(name, schema),
      m('textarea.textarea', {
        name: !schema.exclude ? name : '',
        required: !schema.optional,
        placeholder: _.get(schema, 'autoform.placeholder'),
      })
    )},
    select: function(){return m('.field',
      attr.label(name, schema),
      m('.select', m('select',
        {
          name: !schema.exclude ? name : '',
          required: !afState.optional
        },
        m('option', {value: ''}, 'Select one'),
        schema.autoform.options(name, afState.form[opts.id])
        .map(function(i){return m('option', {
          value: i.value,
          selected: !!_.get(afState.form, [opts.id, name])
        }, i.label)})
      )),
      m('p.help', _.get(schema, 'autoform.help'))
    )},
    standard: function(){
      if(schema.type === Object){return m('.box',
        attr.label(name, schema),
        _.map(opts.schema, function(val, key){
          return _.merge(val, {name: key})
        }).filter(function(i){
          function getLen(str){return _.size(_.split(str, '.'))};
          return _.every([
            _.includes(i.name, normal(name)+'.'),
            getLen(name)+1 === getLen(i.name)
          ])
        }).map(function(i){
          return inputTypes(
            name+'.'+_.last(i.name.split('.')),
            opts.schema[i.name]
          )[_.get(schema, 'autoform.type') || 'standard']()
        }),
        m('p.help', _.get(schema, 'autoform.help'))
      )}

      else if(schema.type === Array){return m('.box',
        attr.label(name, schema),
        m('.button.is-success', attr.arrLen(name, 'inc'), '+ Add'),
        m('.button.is-warning', attr.arrLen(name, 'dec'), '- Rem'),
        m('.button', afState.arrLen[name]),
        _.range(afState.arrLen[name]).map(function(i){
          return inputTypes(
            name+'.'+i,
            opts.schema[normal(name)+'.$']
          )[_.get(schema, 'autoform.type') || 'standard']()
        }),
        m('p.help', _.get(schema, 'autoform.help'))
      )}

      else{return m('.field',
        attr.label(name, schema),
        m('.control', m('input.input', {
          step: 'any', name: !schema.exclude ? name : '',
          placeholder: _.get(schema, 'autoform.placeholder'),
          value: _.get(afState.form, [opts.id, name]),
          required: !schema.optional, pattern: schema.regExp,
          min: schema.minMax && schema.minMax(name, afState.form[opts.id])[0],
          max: schema.minMax && schema.minMax(name, afState.form[opts.id])[1],
          onchange: schema.autoRedraw && function(){},
          type: [
            [String, 'text'],
            [Number, 'number'],
            [Date, 'date']
          ].filter(function(i){
            return i[0] === schema.type
          })[0][1],
        })),
        m('p.help', _.get(schema, 'autoform.help'))
      )}
    },
  }};
  return m('form', attr.form,
    _.map(opts.schema, function(val, key){
      if(!_.includes(key, '.')){
        return inputTypes(key, val)
        [_.get(val, 'autoform.type') || 'standard']()
      }
    }),
    m('.row', m('input.button', _.merge({
      type: 'submit', value: 'Submit', class: 'is-primary'
    }, opts.submit)))
  )
}}}