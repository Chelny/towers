# Towers <a name="readme-top"></a>

Towers is made with <a href="https://nextjs.org/" target="_blank">Next.js</a>, <a href="https://tailwindcss.com/" target="_blank">TailwindCSS</a>, <a href="https://www.prisma.io/" target="_blank">Prisma</a> and <a href="https://www.postgresql.org/" target="_blank">PostgreSQL</a>.

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Stylelint](https://img.shields.io/badge/stylelint-000?style=for-the-badge&logo=stylelint&logoColor=white)
![ESLint](https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

## Installation

**Clone project**

```
git clone git@github.com:Chelny/towers.git
```

**Fill Environment File**

Navigate to the root directory of the project. Create a new file named `.env` and fill it with the required environment variables based on the provided `.env.example` file.

```
HOSTNAME="localhost"
BASE_URL="http://localhost:3000"
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public&serverTimezone=UTC"
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_RESEND_KEY=
// ...rest of file
```

Steps:

- Change the DATABASE_URL placeholders to your database info
- Generate an auth secret key (Mac/Linux: `openssl rand -base64 32`)
- Register a OAuth application on Github to get the ID and secret
- Register a OAuth application on Google to get the ID and secret
- Create an account at [resend.com](https://resend.com/) to test email sending functionality and get the API key from there

**Start PostgreSQL server**

```
# Mac command
sudo service postgresql start
```

**Push Prisma schema to database**

```
npm run prisma:push:dev
```

**Populate the database with data**

```
npm run prisma:seed:dev
```

This command adds initial data in the database such as rooms.

**Browse the data**

```
npm run prisma:studio:dev
```

This command opens Prisma Studio, a visual interface for exploring and managing your data. Use it to inspect the data in your database at http://localhost:5555.

Then, on another terminal...

**Install dependencies**

```
npm i
```

**Serve the client**

```
npm run dev
```

This command starts the development server, allowing you to access your application locally at http://localhost:3000.

<p align="end">(<a href="#readme-top">back to top</a>)</p>
