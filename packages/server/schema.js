const Error = require('@cardstack/data-source/error');
const Field = require('@cardstack/server/field');
const Constraint = require('@cardstack/server/constraint');
const ContentType = require('@cardstack/server/content-type');
const Plugins = require('@cardstack/server/plugins');
const bootstrapSchema = require('./bootstrap-schema');

module.exports = class Schema {

  static async bootstrap() {
    // Our schema itself has a schema. This meta-schema isn't editable.
    return this.loadFrom(bootstrapSchema);
  }

  static ownTypes() {
    return ['content-types', 'fields', 'constraints'];
  }

  static async loadFrom(models) {
    let plugins = await Plugins.load();
    let constraints = new Map();
    for (let model of models) {
      if (!this.ownTypes().includes(model.type)) {
        throw new Error(`attempted to load schema including non-schema type "${model.type}"`);
      }
      if (model.type === 'constraints') {
        constraints.set(model.id, new Constraint(model, plugins));
      }
    }

    let fields = new Map();
    for (let model of models) {
      if (model.type === 'fields') {
        fields.set(model.id, new Field(model, plugins, constraints));
      }
    }

    let types = new Map();
    for (let model of models) {
      if (model.type === 'content-types') {
        types.set(model.id, new ContentType(model, fields));
      }
    }

    return new this(types, fields);
  }

  constructor(types, fields) {
    this.types = types;
    this.fields = fields;
    this._mapping = null;
  }

  async validationErrors(document) {
    let errors = [];

    let type = this.types.get(document.type);
    if (!type) {
      errors.push(new Error(`"${document.type}" is not a valid type`, {
        status: 400,
        source: { pointer: '/data/type' }
      }));
      return errors;
    }

    errors = errors.concat(await type.validationErrors(document));

    return errors;
  }

  mapping() {
    if (!this._mapping) {
      this._mapping = {};
      for (let contentType of this.types.values()) {
        this._mapping[contentType.id] = contentType.mapping();
      }
    }
    return this._mapping;
  }

};