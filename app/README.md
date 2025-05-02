# 🐾 Rainy Day Animal Captions

A light-hearted Next.js toy app for captioning cats and dogs. Users can view a gallery of funny images, search by caption or name, and add their own captions using random cat or dog photos. Built to cheer up your rainy day ☕️🐶🐱

The primary purpose of this app is to illustrate how to deploy a NextJS + Database + User-defined Secrets application to AWS using the CDK.
See the README in [`../aws_cdk/`](../aws_cdk/README.md) for more information.

---

## ✨ Features

- Random cat & dog image fetching (TheCatAPI + Dog CEO)
- Caption submission with optional username
- Flag-as-abusive support for community moderation
- Gallery view with search & filtering
- Modal-based captioning UX
- Background refresh for near real-time updates

---

## 🧑‍💻 Local Development

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Seed the database with 20 fun examples:

```bash
npm run seed
```

Run type checks and formatting:

```bash
npm run typecheck
npm run format
```

---

## 🐳 Production Build (Docker)

Build a multistage container and run locally:

```bash
docker build -t rainy-day-app .
docker run -p 3000:3000 rainy-day-app
```

---

## ☁️ Deployment

This app is deployed to AWS Fargate via CDK. For infrastructure details, secrets, and deployment scripts:

➡️ **See [`./aws_cdk/`](./aws_cdk)**

---

## 📄 License

MIT — have fun.

