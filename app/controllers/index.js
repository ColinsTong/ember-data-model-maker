import Constants from 'ember-data-model-maker/utils/constants';
import getModelInfo from 'ember-data-model-maker/utils/get-model-info';
import Ember from 'ember';

export default Ember.ArrayController.extend({
  adapter: Constants.ADAPTER_OPTIONS[0],
  adapterOptions: Constants.ADAPTER_OPTIONS,
  modelFormat: Constants.MODEL_FORMAT_OPTIONS[0],
  modelFormatOptions: Constants.MODEL_FORMAT_OPTIONS,
  creatingNewModel: false,
  jsonObjects: [],
  modelObjects: [],
  isGlobalFormat: Ember.computed.equal('modelFormat', Constants.MODEL_FORMAT_GLOBAL),

  // Observers
  modelObserver: function() {
    var modelObjects = this.get('modelObjects');
    this.set('jsonObjects', modelObjects);
  }.observes('modelObjects'),

  changeObserver: function() {
    Ember.run.once(this, function() {
      getModelInfo(this);
    });
  }.observes('adapter'),

  // Actions
  actions: {
    // Add a new model
    newModel: function() {
      this.set('creatingNewModel', true);
    },
    // Add a new field
    newField: function(model) {
      var currentFields = model.get('fields'),
        _this = this;

      currentFields.then(function (data) {
        var newField = _this.store.createRecord('field', {
          name: '',
          parentModel: model
        });

        data.addObject(newField);
      });
    },
    // Remove a model
    removeModel: function(model) {
      var fields = model.get('fields'),
          _this = this;

      // iterate through fields and delete those records
      fields.forEach(function(field) {
        field.deleteRecord();
      });

      model.deleteRecord();

      // trigger an update of the json,etc.
      // this does a mock ajax call or something, so it needs a timeout to work correctly
      Ember.run.later(function() {
        getModelInfo(_this);
      }, 100);
    }
  }
});
