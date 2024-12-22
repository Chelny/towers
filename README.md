<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Contributors](https://img.shields.io/github/contributors/Chelny/towers.svg?style=for-the-badge)](https://github.com/Chelny/towers/graphs/contributors)
[![Forks](https://img.shields.io/github/forks/Chelny/towers.svg?style=for-the-badge)](https://github.com/Chelny/towers/network/members)
[![Stargazers](https://img.shields.io/github/stars/Chelny/towers.svg?style=for-the-badge)](https://github.com/Chelny/towers/stargazers)
[![Issues](https://img.shields.io/github/issues/Chelny/towers.svg?style=for-the-badge)](https://github.com/Chelny/towers/issues)
[![MIT License](https://img.shields.io/github/license/Chelny/towers.svg?style=for-the-badge)](https://github.com/Chelny/towers/blob/master/LICENSE.txt)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Chelny/towers">
    <img src="public/logo.png" alt="Logo" width="64" height="64">
  </a>

  <h3 align="center">Towers</h3>

  <p align="center">
    <a href="https://github.com/Chelny/towers"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Chelny/towers">View Demo</a>
    ·
    <a href="https://github.com/Chelny/towers/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/Chelny/towers/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul style="padding-inline-start: 10px; margin: 0;">
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul style="padding-inline-start: 10px; margin: 0;">
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

This project is inspired by Yahoo! Towers but is an independent work. It is not affiliated with or endorsed by Yahoo! or its entities.

### Built With

[![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/TR/CSS/#css)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux.js.org/)
[![Stylelint](https://img.shields.io/badge/stylelint-000?style=for-the-badge&logo=stylelint&logoColor=white)](https://stylelint.io/)
[![ESLint](https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)](https://prettier.io/docs/en/options.html)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/socket.io-black?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- Postgres
- pgAdmin
- pnpm
  ```sh
  npm install -g pnpm
  ```

### Installation

1. Clone the repository

   ```sh
   git clone git@github.com:Chelny/towers.git
   cd towers
   ```

1. Install dependencies

   ```sh
   pnpm install
   ```

1. Create and fill the .env file

   ```sh
   cp .env.example .env
   ```

1. Start Postgres server

1. Push Prisma schema to database

   ```sh
   npm run prisma:push
   ```

1. Seed the database

   ```sh
   npm run prisma:seed:dev
   ```

   Initial data will be added in the database such as rooms.

1. Run the client

   ```sh
   npm run dev
   ```

   This command starts the development server, allowing you to access your application locally at http://localhost:3000.

<p align="end">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->

## Usage

_TODO_

<p align="end">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- General
  - [x] Add links to Terms of Service and Privacy Policy in `/sign-in` and `/sign-up` pages
  - [ ] Multi-language Support
    - [ ] French
  - [ ] Redirect new user that signs up with OAuth to `/new-user` (with better-auth)
  - [ ] Fix delete user redirection from confirmation link
  - [ ] Fix passkeys (sign-in and profile) - Known issue: Will be fixed in 1.1.x
  - [ ] Add OTP (email and phone)
  - [x] Add analytics
  - [ ] Add tooltip
  - [ ] Add toast
- User
  - [ ] Add predefined avatars or allow users to upload their avatar
  - [ ] Prevent user from accessing their account while in a game room (show prompt on click)
- Room
  - [ ] Prevent users from accessing a room directly by its URL (e.g., full rooms)
  - [x] Lower recommended window size - Current: 1350px by 768px
  - [ ] Invitation Request: Accept table invitation
  - [ ] Invitation Request: Decline table invitation: Emit socket event + send decline reason to the other user
  - [ ] Player Information: Send private message endpoint
- Table
  - [ ] Prevent users from accessing a table directly by its URL (e.g., private tables)
  - [ ] Fix: In HTML, `<form>` cannot be a descendant of `<form>`
  - [ ] Sidebar: Add boot user endpoint + socket event
  - [ ] Sidebar: Add invite user socket event + only show users not in the table
  - [ ] Game: Attacks should be sent to the opponents’ board
  - [ ] Game: Seated users from teams 2–4 must play their game from team 1’s seat
  - [ ] Game: Consider other team players’ boards when placing pieces
  - [ ] Chat: Ratings update: `[username]’s old rating: 2050; new rating: 2040`
  - [ ] Chat: Cipher key:
    - [ ] Cipher key text: For each Tower made on the game board. Example: `*** V ==> M`
    - [ ] Code after winning 25 games in 2 hours: `2FKK 2OF W1VAM2FO 91MO 8EWOF2 NF9 7HW3FE` (no asterisks at the beginning)
    - [ ] Hero message: Click on chat input, click TAB, then type. Shouldn’t see it typed anywhere. Example: `*** [username] is a hero of Yahoo! Towers.`
- Server
  - [ ] Manage errors for specific users in specific rooms

See the [open issues](https://github.com/Chelny/towers/issues) for a full list of proposed features (and known issues).

<p align="end">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="end">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

[![Bluesky](https://img.shields.io/badge/Bluesky-1185FE?style=for-the-badge)](https://bsky.app/profile/chelny.bsky.social)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/chelny)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/Chelny)

<p align="end">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Choose an Open Source License](https://choosealicense.com)
- [Flaticon](https://www.flaticon.com/)
- [Img Shields](https://shields.io/)
- [React Icons](https://react-icons.github.io/react-icons/)

<p align="end">(<a href="#readme-top">back to top</a>)</p>
