# Barebones example application with safe-api

## Run:

First, at the root level of the git repository, build the project:
```
yarn && yarn build
```

The following command spins up both the backend and frontend. Ctrl-C will terminate both.

```
yarn run-example
```

The backend is served on port 8080, and the frontend is served at [http://localhost:8081](http://localhost:8081).

## Directory structure:

### [shared/api.js](shared/api.js)
This is where the shared API definition is located

### [backend/index.js](backend/index.js)
Imports the shared api definition to use for a type-safe server route.


### [frontend/index.js](frontend/index.js)
Imports the shared api definition to use for a type-safe client.
