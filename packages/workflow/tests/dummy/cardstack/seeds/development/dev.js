/* eslint-env node */

const JSONAPIFactory = require('@cardstack/test-support/jsonapi-factory');

function initialModels() {
  let initial = new JSONAPIFactory();

  initial.addResource('content-types', 'changes')
    .withRelated('fields', [
      initial.addResource('fields', 'status').withAttributes({
        fieldType: '@cardstack/core-types::string'
      }),
      initial.addResource('fields', 'priority').withAttributes({
        fieldType: '@cardstack/core-types::string'
      }),
      initial.addResource('fields', 'category').withAttributes({
        fieldType: '@cardstack/core-types::string'
      }),
      initial.addResource('fields', 'is-handled').withAttributes({
        fieldType: '@cardstack/core-types::boolean'
      }),
    ]);
  //TODO: Can we get the exported priority names here?
  initial.addResource('changes', '1')
    .withAttributes({
      status: 'pending',
      priority: 'Need Response',
      category: 'Request to publish live',
      isHandled: false,
    });
  initial.addResource('changes', '2')
    .withAttributes({
      status: 'approved', // CueCard prop
      priority: 'Need Response',
      category: 'Request to publish live',
      isHandled: false,
    });
  initial.addResource('changes', '3')
    .withAttributes({
      status: 'denied',
      priority: 'Need Response',
      category: 'Ready for copyediting',
      isHandled: false,
    });
  initial.addResource('changes', '4')
    .withAttributes({
      status: 'approved',
      priority: 'Automatically processed',
      category: 'Course information synced',
      isHandled: true,
    });
  return initial.getModels();
}

module.exports = [
  {
    type: 'plugin-configs',
    id: 0,
    attributes: {
      module: '@cardstack/hub'
    },
    relationships: {
      'default-data-source': {
        data: { type: 'data-sources', id: 0 }
      }
    }
  },
  {
    type: 'plugin-configs',
    id: 1,
    attributes: {
      module: '@cardstack/ephemeral'
    }
  },
  {
    type: 'plugin-configs',
    id: 2,
    attributes: {
      module: '@cardstack/jsonapi'
    }
  },
  {
    type: 'data-sources',
    id: 0,
    attributes: {
      'source-type': '@cardstack/ephemeral',
      params: {
        initialModels: initialModels()
      }
    }
  },
  {
    type: 'grants',
    id: 0,
    attributes: {
      'may-create-resource': true,
      'may-update-resource': true,
      'may-delete-resource': true,
      'may-write-field': true
    }
  }
];