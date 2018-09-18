# MongaLisa JSON Schemas

This package adds JSON Schemas support for records validation in mongalisa

```
npm add @shortlyster/mongalisa-json-schemas
```

## Basic Usage

```js
const mongalisa = require('@shortlyster/mongalisa');
const jsonSchemaSupport = require('@shrotlyster/mongalisa-json-schemas');

mongalisa.plugin(jsonSchemaSupport);


plugin(jsonSchemaSupport());

class User {
  static schema = {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      password: {
        type: 'string'
      }
    },
    required: ['email', 'password']
  };
}

const users = new mongalisa.Controller(User);

const user = await users.create({
  email: 'nikolay@rocks.com',
  password: 'Ba(k0/\\/!'
});

await users.create({ email: 'hack!' }); // throws ValidationError
```

## Copyright & License

All code in this repository is the property of Compono Pty Ltd.

Copyright (C) 2018 Compono Pty Ltd.


