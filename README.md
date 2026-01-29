# 📦 Armoury Crate

**For Destiny 2 Players, by a Vibe-Coder.**

Welcome to **Armoury Crate**! This is a tool created specifically for Destiny 2 players to manage their gear, similar to the legendary DIM (Destiny Item Manager).

**⚠️ The Vibe Check:**
This is a "vibe coded" project. That means we're building it fast, loose, and with passion using cutting-edge tech. Things might break occasionally, pixels might misalign, but don't worry—we're always fixing it and making it better. It's a living, breathing project.

---

## 🛠️ Under the Hood (How We Built It)

We didn't just want to build another item manager; we wanted to build something *modern* and *polyglot*. Here is the "Hybrid Engine" powering this beast:

### 1. The Frontend: Next.js 15 (TypeScript)
We use the latest **Next.js 15 (App Router)** for the user interface.
- **Why?** It's fast, server-side rendered, and gives us that snappy, premium feel.
- **Where?** The entire UI (`src/app`) lives here.

### 2. The Core Logic: Gleam ✨
This is the secret sauce. Instead of writing complex logic in plain JavaScript, we use **Gleam**.
- **What is it?** A friendly, type-safe language that compiles to JavaScript (and Erlang).
- **Why?** It guarantees we don't have silly bugs when processing your massive Destiny profile. If it compiles, it generally works.
- **How it works:** We pass your raw data from Bungie to our Gleam "Brain", which parses it and sends back clean, structured data to the UI.

### 3. The Infrastructure: Cloudflare ☁️
We deploy everything to the Edge using **Cloudflare Pages**.
- **D1 Database:** A SQL database at the edge to store your loadouts (coming soon).
- **KV Storage:** A super-fast cache for the massive Destiny 2 Manifest.
- **Security:** HttpOnly cookies and server-side authentication ensure your Bungie tokens are never exposed to the client.

---

## 🚀 Getting Started (For Devs)

Want to poke around the code? Here's how to run the hybrid engine locally.

### Prerequisites
- Node.js 20+
- The `gleam` binary (usually we have a local copy in `bin/`, or install it globally).

### Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Build the Gleam Core**
    You *must* compile the Gleam code to JavaScript before running the frontend.
    ```bash
    npm run build:gleam
    ```

3.  **Run the App**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) and login with your Bungie account!

---

*Verified Vibe. Built with ❤️.*
