<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Simple user management API built with Nest, TypeScript, TypeORM and PostgreSQL.

## Requirements

Docker and Docker Compose

## Running the application

```bash
$ docker compose up
```

This will build and start the API and database containers, run the database migrations, run the tests and start the Nest API. 

## Using the application

Once the containers are up and running navigate to the Swagger interface at: `http://localhost:3000/swagger`

### Create a user

Use `POST /users` to create a user in the database.

### Login and get JWT auth token

Use `POST /auth/login` to login with the user created in the last step.

Copy and paste the responding token into the modal revealed by the `Authorize` button at the top right corner of the page.

### View your user

You are authorized to use `GET /users/{id}` endpoint to view your user.

If you try to use an id that is not yours you will recieve a `403 Forbidden` response.

### Upload a profile image

As a normal user you are authorized to upload profile images.

Use `POST /users/image` to do so. Note the image name in the response. The image was successfully stored on the server.

### Update user to have admin role

The rest of the endpoints (except user updates) can only be used by an admin. 

Use `PATCH /users/{id}` to update your user role to `ADMIN`. You only need to set the fields you wish to update:

```
{
  "role": "ADMIN"
}
```

*Normally a normal user should not be able to upgrade their role. I am allowing this to make it easier to test.*

In order to have this role reflected in the JWT you will need to use `POST /auth/login` again and add the new token the `Authorize` modal.

### Do admin stuff

As an admin you can now view all users using `GET /users`.

You can also delete other users using `DELETE /users/{id}`. If you try to delete yourself you will recieve a `403 Forbidden` response.

Because we want our admins to be anonymous they are not allowed to upload profile pictures.

As an admin if you use `POST /users/image` you will receive a `403 Forbidden` response.